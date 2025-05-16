const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { Op } = require('sequelize');
const sendEmail = require('../_helpers/send-email');
const db = require('../_helpers/db');
const Role = require('../_helpers/role');
const config = require('../config.json');
const expressJwt = require('express-jwt');
const { secret } = require('../config.json');

module.exports = {
    authenticate,
    refreshToken,
    revokeToken,
    register,
    verifyEmail,
    forgotPassword,
    validateResetToken,
    resetPassword,
    getAll,
    getById,
    create,
    update,
    updateStatus,
    delete: _delete,
    deleteAllNonAdminUsers
};

async function authenticate({ email, password, ipAddress }) {
    const account = await db.Account.scope('withHash').findOne({ where: { email } });

    // Check if account exists
    if (!account) {
        throw 'Email does not exist';
    }
    
    // Check if password is correct
    if (!(await bcrypt.compare(password, account.passwordHash))) {
        throw 'Password is incorrect';
    }
    
    // Check if email is verified
    if (!account.verified) {
        throw 'Email not verified. Please check your email for verification instructions';
    }
    
    // Check if account is active
    if (account.status !== 'Active') {
        throw 'Account is inactive. Please contact an administrator';
    }

    // authentication successful
    const jwtToken = generateJwtToken(account);
    const refreshToken = generateRefreshToken(account, ipAddress);

    // save refresh token
    await refreshToken.save();

    // return basic details and tokens
    return {
        ...basicDetails(account),
        jwtToken,
        refreshToken: refreshToken.token
    };
}

async function refreshToken({ token, ipAddress }) {
    const refreshToken = await getRefreshToken(token);
    const account = await refreshToken.getAccount();

    // replace old refresh token with a new one and save
    const newRefreshToken = generateRefreshToken(account, ipAddress);
    refreshToken.revoked = Date.now();
    refreshToken.revokedByIp = ipAddress;
    refreshToken.replacedByToken = newRefreshToken.token;
    await refreshToken.save();
    await newRefreshToken.save();

    // generate new jwt
    const jwtToken = generateJwtToken(account);

    // return basic details and tokens
    return {
        ...basicDetails(account),
        jwtToken,
        refreshToken: newRefreshToken.token
    };
}

async function revokeToken({ token, ipAddress }) {
    const refreshToken = await getRefreshToken(token);

    // revoke token and save
    refreshToken.revoked = Date.now();
    refreshToken.revokedByIp = ipAddress;
    await refreshToken.save();
}

async function register(params, origin) {
    // validate
    if (await db.Account.findOne({ where: { email: params.email } })) {
        // send already registered error in email to prevent account enumeration
        return await sendAlreadyRegisteredEmail(params.email, origin);
    }

    // create account object
    const account = new db.Account(params);

    // first registered account is an admin
    const isFirstAccount = (await db.Account.count()) === 0;
    account.role = isFirstAccount ? Role.Admin : Role.User;
    
    // Auto verify first account (admin)
    if (isFirstAccount) {
        account.verified = Date.now();
        account.verificationToken = null;
    } else {
        account.verificationToken = randomTokenString();
    }

    // hash password
    account.passwordHash = await hash(params.password);

    // save account
    await account.save();

    // send verification email only for non-admin accounts
    if (!isFirstAccount) {
        await sendVerificationEmail(account, origin);
    } else {
        // Return success message for admin account
        return { message: 'Registration successful, you can now login' };
    }
}

async function verifyEmail({ token }) {
    const account = await db.Account.findOne({ where: { verificationToken: token } });

    if (!account) throw 'Verification failed';

    account.verified = Date.now();
    account.verificationToken = null;
    await account.save();

    return { message: 'Verification successful' };
}

async function forgotPassword({ email }, origin) {
    const account = await db.Account.findOne({ where: { email } });

    // always return ok response to prevent email enumeration
    if (!account) return;

    // create reset token that expires after 24 hours
    account.resetToken = randomTokenString();
    account.resetTokenExpires = new Date(Date.now() + 24*60*60*1000);
    await account.save();

    // send email
    await sendPasswordResetEmail(account, origin);
}

async function validateResetToken({ token }) {
    const account = await db.Account.findOne({
        where: {
            resetToken: token,
            resetTokenExpires: { [Op.gt]: Date.now() }
        }
    });

    if (!account) throw 'Invalid token';

    return account;
}

async function resetPassword({ token, password }) {
    const account = await validateResetToken({ token });

    // update password and remove reset token
    account.passwordHash = await hash(password);
    account.passwordReset = Date.now();
    account.resetToken = null;
    await account.save();
}

async function getAll() {
    const accounts = await db.Account.findAll();
    return accounts.map(x => basicDetails(x));
}

async function getById(id) {
    const account = await getAccount(id);
    return basicDetails(account);
}

async function create(params) {
    // validate
    if (await db.Account.findOne({ where: { email: params.email } })) {
        throw 'Email "' + params.email + '" is already registered';
    }

    // Start transaction
    const transaction = await db.sequelize.transaction();

    try {
        const account = new db.Account(params);

        // Set up verification
        account.verificationToken = randomTokenString();
        account.verified = null;

        // hash password
        account.passwordHash = await hash(params.password);

        // save account
        await account.save({ transaction });

        // Create employee record
        await db.Employee.create({
            accountId: account.id,
            position: params.position || 'Employee', // Default position if not specified
            status: 'Active',
            createdBy: params.createdBy || 1,
            updatedBy: params.createdBy || 1
        }, { transaction });

        await transaction.commit();

        // Send verification email
        await sendVerificationEmail(account, params.origin);

        return basicDetails(account);
    } catch (error) {
        await transaction.rollback();
        throw error;
    }
}

async function update(id, params) {
    const account = await getAccount(id);
    const oldValues = {
        title: account.title,
        firstName: account.firstName,
        lastName: account.lastName,
        email: account.email,
        status: account.status
    };

    // validate (if email was changed)
    if (params.email && account.email !== params.email && 
        await db.Account.findOne({ where: { email: params.email } })) {
        throw 'Email "' + params.email + '" is already taken';
    }

    // hash password if it was entered
    if (params.password) {
        params.passwordHash = await hash(params.password);
    }

    // Normalize status if provided
    if (params.status) {
        params.status = (params.status.toLowerCase() === 'inactive') ? 'Inactive' : 'Active';
    }

    // copy params to account and save
    Object.assign(account, params);
    account.updated = Date.now();
    await account.save();

    // Check if status was changed and sync with employee
    if (params.status && oldValues.status !== account.status) {
        await syncEmployeeStatus(account.id, account.status);
    }

    // Create workflow records for profile updates
    const changes = [];
    if (oldValues.title !== account.title) {
        changes.push({
            field: 'title',
            oldValue: oldValues.title,
            newValue: account.title
        });
    }
    if (oldValues.firstName !== account.firstName) {
        changes.push({
            field: 'firstName',
            oldValue: oldValues.firstName,
            newValue: account.firstName
        });
    }
    if (oldValues.lastName !== account.lastName) {
        changes.push({
            field: 'lastName',
            oldValue: oldValues.lastName,
            newValue: account.lastName
        });
    }
    if (oldValues.email !== account.email) {
        changes.push({
            field: 'email',
            oldValue: oldValues.email,
            newValue: account.email
        });
    }
    if (oldValues.status !== account.status) {
        changes.push({
            field: 'status',
            oldValue: oldValues.status,
            newValue: account.status
        });
    }

    // Create a workflow entry for each change
    try {
        for (const change of changes) {
            await db.Workflow.create({
                employeeId: account.id,
                type: 'ProfileUpdate',
                description: `Updated ${change.field}`,
                status: 'Completed',
                previousValue: change.oldValue,
                newValue: change.newValue,
                createdBy: params.updatedBy || 1,
                updatedBy: params.updatedBy || 1
            });
        }
    } catch (error) {
        console.error('Error creating workflow records:', error);
        // Continue despite workflow errors
    }

    return basicDetails(account);
}

async function updateStatus(id, status) {
    const account = await getAccount(id);
    const oldStatus = account.status;

    // Normalize status value (make it case insensitive)
    const normalizedStatus = (status && status.toLowerCase() === 'inactive') ? 'Inactive' : 'Active';

    // Only update if status has changed
    if (oldStatus !== normalizedStatus) {
        // Update status
        account.status = normalizedStatus;
        account.updated = Date.now();
        await account.save();

        // Create workflow record for status change
        try {
            await db.Workflow.create({
                employeeId: account.id,
                type: 'StatusUpdate',
                description: `Updated account status from ${oldStatus} to ${normalizedStatus}`,
                status: 'Completed',
                previousValue: oldStatus,
                newValue: normalizedStatus,
                createdBy: account.id,
                updatedBy: account.id
            });
        } catch (error) {
            // Log error but don't fail the status update
            console.error('Error creating workflow record:', error);
        }
        
        // Sync employee status with account status
        await syncEmployeeStatus(account.id, normalizedStatus);
    }

    // Always return the account details, even if no change was made
    return basicDetails(account);
}

async function _delete(id) {
    const account = await getAccount(id);
    await account.destroy();
}

async function deleteAllNonAdminUsers() {
    try {
        // Find all non-admin accounts
        const nonAdminAccounts = await db.Account.findAll({
            where: {
                role: { [Op.ne]: Role.Admin }
            }
        });

        // Delete associated records and accounts
        for (const account of nonAdminAccounts) {
            // Delete associated employee record
            await db.Employee.destroy({
                where: { accountId: account.id }
            });

            // Delete associated workflow records
            await db.Workflow.destroy({
                where: { employeeId: account.id }
            });

            // Delete associated refresh tokens
            await db.RefreshToken.destroy({
                where: { accountId: account.id }
            });

            // Delete the account
            await account.destroy();
        }

        return { 
            message: `Successfully deleted ${nonAdminAccounts.length} non-admin users`,
            deletedCount: nonAdminAccounts.length
        };
    } catch (error) {
        console.error('Error deleting non-admin users:', error);
        throw 'Failed to delete non-admin users';
    }
}

// helper functions

async function getAccount(id) {
    const account = await db.Account.findByPk(id);
    if (!account) throw 'Account not found';
    return account;
}

async function getRefreshToken(token) {
    const refreshToken = await db.RefreshToken.findOne({ where: { token } });
    if (!refreshToken || !refreshToken.isActive) throw 'Invalid token';
    return refreshToken;
}

async function hash(password) {
    return await bcrypt.hash(password, 10);
}

function generateJwtToken(account) {
    // create a jwt token containing the account id that expires in 15 minutes
    return jwt.sign(
        { 
            sub: account.id,
            id: account.id,
            role: account.role 
        }, 
        config.secret, 
        { expiresIn: '15m' }
    );
}

function generateRefreshToken(account, ipAddress) {
    // create a refresh token that expires in 7 days
    return new db.RefreshToken({
        accountId: account.id,
        token: randomTokenString(),
        expires: new Date(Date.now() + 7*24*60*60*1000),
        createdByIp: ipAddress
    });
}

function randomTokenString() {
    return crypto.randomBytes(40).toString('hex');
}

function basicDetails(account) {
    const { id, title, firstName, lastName, email, role, status, created, updated, isVerified } = account;
    return { id, title, firstName, lastName, email, role, status, created, updated, isVerified };
}

async function sendVerificationEmail(account, origin) {
    let message;
    if (origin) {
        // Use the deployed backend URL for direct verification
        const backendUrl = process.env.API_URL || 'https://user-management-backend-4dpx.onrender.com';
        const frontendUrl = process.env.FRONTEND_URL || 'https://user-management-frontend-4j6n.onrender.com';
        const verifyUrl = `${backendUrl}/accounts/verify-email/${account.verificationToken}`;
        message = `<p>Please click the below link to verify your email address:</p>
                   <p><a href="${verifyUrl}">${verifyUrl}</a></p>`;
    } else {
        message = `<p>Please use the below token to verify your email address with the <code>/account/verify-email</code> api route:</p>
                   <p><code>${account.verificationToken}</code></p>`;
    }

    await sendEmail({
        to: account.email,
        subject: 'Sign-up Verification API - Verify Email',
        html: `<h4>Verify Email</h4>
               <p>Thanks for registering!</p>
               ${message}`
    });
}

async function sendAlreadyRegisteredEmail(email, origin) {
    let message;
    if (origin) {
        message = `<p>If you don't know your password please visit the <a href="${origin}/account/forgot-password">forgot password</a> page.</p>`;
    } else {
        message = `<p>If you don't know your password you can reset it via the <code>/account/forgot-password</code> api route.</p>`;
    }

    await sendEmail({
        to: email,
        subject: 'Sign-up Verification API - Email Already Registered',
        html: `<h4>Email Already Registered</h4>
               <p>Your email <strong>${email}</strong> is already registered.</p>
               ${message}`
    });
}

async function sendPasswordResetEmail(account, origin) {
    let message;
    if (origin) {
        const resetUrl = `${origin}/account/reset-password?token=${account.resetToken}`;
        message = `<p>Please click the below link to reset your password, the link will be valid for 1 day:</p>
                   <p><a href="${resetUrl}">${resetUrl}</a></p>`;
    } else {
        message = `<p>Please use the below token to reset your password with the <code>/account/reset-password</code> api route:</p>
                   <p><code>${account.resetToken}</code></p>`;
    }

    await sendEmail({
        to: account.email,
        subject: 'Sign-up Verification API - Reset Password',
        html: `<h4>Reset Password Email</h4>
               ${message}`
    });
}

async function syncEmployeeStatus(accountId, status) {
    try {
        // Find employee associated with this account
        const employee = await db.Employee.findOne({ where: { accountId } });
        
        if (employee) {
            // Convert account status to employee status
            const employeeStatus = status === 'Inactive' ? 'Inactive' : 'Active';
            
            // Update employee status
            if (employee.status !== employeeStatus) {
                employee.status = employeeStatus;
                employee.updated = Date.now();
                await employee.save();
                
                // Create workflow record for the employee status change
                await db.Workflow.create({
                    employeeId: employee.id,
                    type: 'Status Change',
                    description: `Employee status updated to ${employeeStatus}`,
                    status: 'Completed',
                    previousValue: employee.status,
                    newValue: employeeStatus,
                    createdBy: accountId,
                    updatedBy: accountId
                });
                
                console.log(`Synced employee #${employee.id} status to ${employeeStatus}`);
            }
        }
    } catch (error) {
        console.error('Error syncing employee status:', error);
        // Don't throw - we don't want to fail the account status update if this fails
    }
}