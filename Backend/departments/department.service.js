const db = require('_helpers/db');

module.exports = {
    getAll,
    getById,
    create,
    update,
    delete: _delete
};

async function getAll() {
    return await db.Department.findAll({
        include: [{
            model: db.Employee,
            as: 'employees',
            attributes: ['id', 'employeeId', 'position', 'status']
        }]
    });
}

async function getById(id) {
    const department = await getDepartment(id);
    return department;
}

async function create(params) {
    // Check if department with same name exists
    if (await db.Department.findOne({ where: { name: params.name } })) {
        throw `Department with name "${params.name}" already exists`;
    }
    
    // Start transaction
    const transaction = await db.sequelize.transaction();
    
    try {
        // Create department
        const department = await db.Department.create(params, { transaction });
        
        // Try to create a workflow entry if there's a createdBy param
        // This is optional as the workflow entry is also created in the frontend
        if (params.createdBy) {
            try {
                // Find an employee associated with this user
                const employee = await db.Employee.findOne({
                    where: { accountId: params.createdBy }
                });
                
                if (employee) {
                    await db.Workflow.create({
                        employeeId: employee.id,
                        type: 'Department Transfer', // Using department-related type
                        description: `Department "${params.name}" created`,
                        status: 'Completed',
                        previousValue: 'New Department',
                        newValue: params.name,
                        createdBy: params.createdBy,
                        updatedBy: params.createdBy
                    }, { transaction });
                }
            } catch (workflowError) {
                // Log error but continue with department creation
                console.error('Error creating workflow for department creation:', workflowError);
            }
        }
        
        // Commit transaction
        await transaction.commit();
        
        return await getDepartment(department.id);
    } catch (error) {
        // Rollback transaction
        await transaction.rollback();
        throw error;
    }
}

async function update(id, params) {
    const department = await getDepartment(id);
    
    // Check if department with same name exists (excluding current)
    if (params.name && params.name !== department.name && 
        await db.Department.findOne({ where: { name: params.name } })) {
        throw `Department with name "${params.name}" already exists`;
    }
    
    // Store old name for workflow
    const oldName = department.name;
    
    // Start transaction
    const transaction = await db.sequelize.transaction();
    
    try {
        // Copy params to department and save
        Object.assign(department, params);
        department.updated = new Date();
        await department.save({ transaction });
        
        // Try to create a workflow entry if there's an updatedBy param
        // This is optional as the workflow entry is also created in the frontend
        if (params.updatedBy) {
            try {
                // Find an employee associated with this user
                const employee = await db.Employee.findOne({
                    where: { accountId: params.updatedBy }
                });
                
                if (employee) {
                    await db.Workflow.create({
                        employeeId: employee.id,
                        type: 'Department Transfer', // Using department-related type
                        description: `Department "${params.name}" updated`,
                        status: 'Completed',
                        previousValue: oldName,
                        newValue: params.name,
                        createdBy: params.updatedBy,
                        updatedBy: params.updatedBy
                    }, { transaction });
                }
            } catch (workflowError) {
                // Log error but continue with department update
                console.error('Error creating workflow for department update:', workflowError);
            }
        }
        
        // Commit transaction
        await transaction.commit();
        
        return await getDepartment(id);
    } catch (error) {
        // Rollback transaction
        await transaction.rollback();
        throw error;
    }
}

async function _delete(id) {
    const department = await getDepartment(id);
    
    // Check if department has employees
    const employeeCount = await db.Employee.count({ where: { departmentId: id } });
    if (employeeCount > 0) {
        throw 'Department cannot be deleted because it has employees assigned';
    }
    
    await department.destroy();
}

// Helper functions
async function getDepartment(id) {
    const department = await db.Department.findByPk(id, {
        include: [{
            model: db.Employee,
            as: 'employees',
            attributes: ['id', 'employeeId', 'position', 'status']
        }]
    });
    if (!department) throw 'Department not found';
    return department;
} 