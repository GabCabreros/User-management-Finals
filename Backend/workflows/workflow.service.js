const db = require('_helpers/db');

module.exports = {
    getAll,
    getByEmployeeId,
    getById,
    create,
    update,
    delete: _delete
};

async function getAll() {
    return await db.Workflow.findAll({
        include: [
            { model: db.Employee, as: 'employee', include: [
                { model: db.Account, as: 'account' },
                { model: db.Department, as: 'department' }
            ]}
        ],
        order: [['created', 'DESC']]
    });
}

async function getByEmployeeId(employeeId) {
    return await db.Workflow.findAll({
        where: { employeeId: employeeId },
        include: [
            { model: db.Employee, as: 'employee', include: [
                { model: db.Account, as: 'account' },
                { model: db.Department, as: 'department' }
            ]}
        ],
        order: [['created', 'DESC']]
    });
}

async function getById(id) {
    const workflow = await getWorkflow(id);
    return workflow;
}

async function create(params) {
    // Check if employee exists
    await getEmployeeById(params.employeeId);
    
    // Create workflow
    const workflow = await db.Workflow.create(params);
    return await getWorkflow(workflow.id);
}

async function update(id, params) {
    const workflow = await getWorkflow(id);
    
    // Copy params to workflow and save
    Object.assign(workflow, params);
    workflow.updated = new Date();
    await workflow.save();
    
    return await getWorkflow(id);
}

async function _delete(id) {
    const workflow = await getWorkflow(id);
    await workflow.destroy();
}

// Helper functions
async function getWorkflow(id) {
    const workflow = await db.Workflow.findByPk(id, {
        include: [
            { model: db.Employee, as: 'employee', include: [
                { model: db.Account, as: 'account' },
                { model: db.Department, as: 'department' }
            ]}
        ]
    });
    if (!workflow) throw 'Workflow not found';
    return workflow;
}

async function getEmployeeById(id) {
    const employee = await db.Employee.findByPk(id);
    if (!employee) throw 'Employee not found';
    return employee;
} 