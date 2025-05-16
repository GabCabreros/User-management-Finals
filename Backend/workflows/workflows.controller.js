const express = require('express');
const router = express.Router();
const Joi = require('joi');
const validateRequest = require('../_middleware/validate-request');
const authorize = require('../_middleware/authorize');
const Role = require('../_helpers/role');
const workflowService = require('./workflow.service');

// Routes
router.get('/', authorize(), getAll);
router.get('/employee/:id', authorize(), getByEmployeeId);
router.get('/:id', authorize(), getById);
router.post('/', authorize(Role.Admin), createSchema, create);
router.put('/:id', authorize(Role.Admin), updateSchema, update);
router.delete('/:id', authorize(Role.Admin), _delete);

module.exports = router;

// Schema validation
function createSchema(req, res, next) {
    const schema = Joi.object({
        employeeId: Joi.number().required(),
        type: Joi.string().valid(
            'Onboarding', 
            'Department Transfer', 
            'Status Change', 
            'Termination', 
            'Request',
            'AccountCreation',
            'ProfileUpdate',
            'DepartmentCreation',
            'DepartmentUpdate',
            'DepartmentDeletion'
        ).required(),
        description: Joi.string().required(),
        status: Joi.string().valid('Pending', 'In Progress', 'Approved', 'Rejected', 'Completed').default('Pending'),
        previousValue: Joi.string().allow(null, ''),
        newValue: Joi.string().allow(null, ''),
        createdBy: Joi.number().required(),
        updatedBy: Joi.number()
    });
    validateRequest(req, next, schema);
}

function updateSchema(req, res, next) {
    const schema = Joi.object({
        status: Joi.string().valid('Pending', 'In Progress', 'Approved', 'Rejected', 'Completed'),
        description: Joi.string(),
        updatedBy: Joi.number().required()
    });
    validateRequest(req, next, schema);
}

// Route handlers
function getAll(req, res, next) {
    workflowService.getAll()
        .then(workflows => res.json(workflows))
        .catch(next);
}

function getByEmployeeId(req, res, next) {
    workflowService.getByEmployeeId(req.params.id)
        .then(workflows => res.json(workflows))
        .catch(next);
}

function getById(req, res, next) {
    workflowService.getById(req.params.id)
        .then(workflow => res.json(workflow))
        .catch(next);
}

function create(req, res, next) {
    workflowService.create(req.body)
        .then(workflow => res.json(workflow))
        .catch(next);
}

function update(req, res, next) {
    workflowService.update(req.params.id, req.body)
        .then(workflow => res.json(workflow))
        .catch(next);
}

function _delete(req, res, next) {
    workflowService.delete(req.params.id)
        .then(() => res.json({ message: 'Workflow deleted successfully' }))
        .catch(next);
} 