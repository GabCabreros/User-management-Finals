const db = require('_helpers/db');
const { Op } = require('sequelize');

module.exports = {
    getAll,
    getById,
    create,
    update,
    delete: _delete,
    transferDepartment
};

async function getAll() {
    const employees = await db.Employee.findAll({
        include: [
            { model: db.Account, as: 'account' },
            { model: db.Department, as: 'department' }
        ]
    });
    return employees;
}

async function getById(id) {
    const employee = await getEmployee(id);
    return employee;
}

async function create(params) {
    // Generate employee ID if not provided
    if (!params.employeeId) {
        const date = new Date();
        const year = date.getFullYear().toString().substr(-2);
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        
        // Get count of employees created this month
        const count = await db.Employee.count({
            where: {
                created: {
                    [Op.gte]: new Date(date.getFullYear(), date.getMonth(), 1)
                }
            }
        });
        
        // Format: YY-MM-XXXX (e.g., 23-01-0001)
        params.employeeId = `${year}-${month}-${(count + 1).toString().padStart(4, '0')}`;
    }
    
    // Create employee
    const employee = await db.Employee.create(params);
    
    // Create workflow entry for onboarding
    await db.Workflow.create({
        employeeId: employee.id,
        type: 'Onboarding',
        description: `Employee ${params.employeeId} onboarded`,
        status: 'Completed',
        createdBy: params.createdBy || 1, // Default to admin if not specified
        updatedBy: params.createdBy || 1
    });
    
    return await getEmployee(employee.id);
}

async function update(id, params) {
    const employee = await getEmployee(id);
    
    // Copy params to employee and save
    Object.assign(employee, params);
    employee.updated = new Date();
    await employee.save();
    
    return await getEmployee(id);
}

async function _delete(id) {
    const employee = await getEmployee(id);
    await employee.destroy();
}

async function transferDepartment(id, params) {
    const employee = await getEmployee(id);
    const oldDepartmentId = employee.departmentId;
    
    // Update employee department
    employee.departmentId = params.departmentId;
    employee.updated = new Date();
    await employee.save();
    
    // Create workflow entry for department transfer
    await db.Workflow.create({
        employeeId: employee.id,
        type: 'Department Transfer',
        description: `Employee transferred to new department`,
        status: 'Completed',
        previousValue: oldDepartmentId ? oldDepartmentId.toString() : 'None',
        newValue: params.departmentId.toString(),
        createdBy: params.updatedBy || 1, // Default to admin if not specified
        updatedBy: params.updatedBy || 1
    });
    
    return await getEmployee(id);
}

// Helper functions
async function getEmployee(id) {
    const employee = await db.Employee.findByPk(id, {
        include: [
            { model: db.Account, as: 'account' },
            { model: db.Department, as: 'department' }
        ]
    });
    if (!employee) throw 'Employee not found';
    return employee;
} 