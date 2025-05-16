const db = require('_helpers/db');

module.exports = {
    getAll,
    getAllByAccount,
    getById,
    create,
    update,
    delete: _delete
};

async function getAll() {
    return await db.Request.findAll({
        include: [
            { model: db.Account, as: 'account' },
            { model: db.RequestItem, as: 'items' }
        ],
        order: [['created', 'DESC']]
    });
}

async function getAllByAccount(accountId) {
    return await db.Request.findAll({
        where: { accountId: accountId },
        include: [
            { model: db.RequestItem, as: 'items' }
        ],
        order: [['created', 'DESC']]
    });
}

async function getById(id) {
    const request = await getRequest(id);
    return request;
}

async function create(params) {
    // Check if account exists
    await getAccountById(params.accountId);
    
    // Start transaction
    const transaction = await db.sequelize.transaction();
    
    try {
        // Create request
        const request = await db.Request.create({
            accountId: params.accountId,
            type: params.type,
            title: params.title,
            description: params.description,
            status: 'Pending',
            createdBy: params.createdBy,
            updatedBy: params.createdBy
        }, { transaction });
        
        // Create request items
        if (params.items && params.items.length > 0) {
            for (const item of params.items) {
                await db.RequestItem.create({
                    requestId: request.id,
                    name: item.name,
                    description: item.description,
                    quantity: item.quantity,
                    status: 'Pending'
                }, { transaction });
            }
        }
        
        // Create workflow entry if employee exists
        const employee = await db.Employee.findOne({ 
            where: { accountId: params.accountId } 
        });
        
        if (employee) {
            await db.Workflow.create({
                employeeId: employee.id,
                type: 'Request',
                description: `New request created: ${params.title}`,
                status: 'Pending',
                createdBy: params.createdBy,
                updatedBy: params.createdBy
            }, { transaction });
        }
        
        // Commit transaction
        await transaction.commit();
        
        return await getRequest(request.id);
    } catch (error) {
        // Rollback transaction
        await transaction.rollback();
        throw error;
    }
}

async function update(id, params) {
    const request = await getRequest(id);
    
    // Start transaction
    const transaction = await db.sequelize.transaction();
    
    try {
        // Update request
        Object.assign(request, {
            type: params.type,
            title: params.title,
            description: params.description,
            status: params.status,
            updatedBy: params.updatedBy,
            updated: new Date()
        });
        await request.save({ transaction });
        
        // Update request items
        if (params.items && params.items.length > 0) {
            for (const item of params.items) {
                if (item.id) {
                    // Update existing item
                    const requestItem = await db.RequestItem.findByPk(item.id);
                    if (requestItem && requestItem.requestId === request.id) {
                        Object.assign(requestItem, {
                            name: item.name,
                            description: item.description,
                            quantity: item.quantity,
                            status: item.status || requestItem.status,
                            updated: new Date()
                        });
                        await requestItem.save({ transaction });
                    }
                } else {
                    // Create new item
                    await db.RequestItem.create({
                        requestId: request.id,
                        name: item.name,
                        description: item.description,
                        quantity: item.quantity,
                        status: 'Pending'
                    }, { transaction });
                }
            }
        }
        
        // Update workflow if status changed
        if (params.status && params.status !== request.status) {
            const employee = await db.Employee.findOne({ 
                where: { accountId: request.accountId } 
            });
            
            if (employee) {
                await db.Workflow.create({
                    employeeId: employee.id,
                    type: 'Request',
                    description: `Request status updated: ${request.title}`,
                    status: params.status,
                    previousValue: request.status,
                    newValue: params.status,
                    createdBy: params.updatedBy,
                    updatedBy: params.updatedBy
                }, { transaction });
            }
        }
        
        // Commit transaction
        await transaction.commit();
        
        return await getRequest(id);
    } catch (error) {
        // Rollback transaction
        await transaction.rollback();
        throw error;
    }
}

async function _delete(id) {
    const request = await getRequest(id);
    
    // Delete request items first (cascade should handle this, but just to be safe)
    await db.RequestItem.destroy({ where: { requestId: id } });
    
    // Delete request
    await request.destroy();
}

// Helper functions
async function getRequest(id) {
    const request = await db.Request.findByPk(id, {
        include: [
            { model: db.Account, as: 'account' },
            { model: db.RequestItem, as: 'items' }
        ]
    });
    if (!request) throw 'Request not found';
    return request;
}

async function getAccountById(id) {
    const account = await db.Account.findByPk(id);
    if (!account) throw 'Account not found';
    return account;
} 