const express = require('express');
const router = express.Router();
const Joi = require('joi');
const validateRequest = require('../_middleware/validate-request');
const authorize = require('../_middleware/authorize');
const Role = require('../_helpers/role');
const employeeService = require('./employee.service');

// Routes
router.get('/', authorize(), getAll);
router.get('/:id', authorize(), getById);
router.post('/', authorize(Role.Admin), createSchema, create);
router.put('/:id', authorize(Role.Admin), updateSchema, update);
router.delete('/:id', authorize(Role.Admin), _delete);
router.put('/:id/transfer', authorize(Role.Admin), transferSchema, transferDepartment);

module.exports = router;

// Schema validation
function createSchema(req, res, next) {
    const schema = Joi.object({
        employeeId: Joi.string(),
        accountId: Joi.number().allow(null),
        departmentId: Joi.number().allow(null),
        position: Joi.string().required(),
        hireDate: Joi.date().default(Date.now),
        status: Joi.string().valid('Active', 'Inactive', 'On Leave', 'Terminated').default('Active'),
        createdBy: Joi.number().required()
    });
    validateRequest(req, next, schema);
}

function updateSchema(req, res, next) {
    const schema = Joi.object({
        accountId: Joi.number().allow(null),
        departmentId: Joi.number().allow(null),
        position: Joi.string(),
        status: Joi.string().valid('Active', 'Inactive', 'On Leave', 'Terminated'),
        updatedBy: Joi.number().required()
    });
    validateRequest(req, next, schema);
}

function transferSchema(req, res, next) {
    const schema = Joi.object({
        departmentId: Joi.number().required(),
        updatedBy: Joi.number().required()
    });
    validateRequest(req, next, schema);
}

// Route handlers
function getAll(req, res, next) {
    employeeService.getAll()
        .then(employees => res.json(employees))
        .catch(next);
}

function getById(req, res, next) {
    employeeService.getById(req.params.id)
        .then(employee => res.json(employee))
        .catch(next);
}

function create(req, res, next) {
    employeeService.create(req.body)
        .then(employee => res.json(employee))
        .catch(next);
}

function update(req, res, next) {
    employeeService.update(req.params.id, req.body)
        .then(employee => res.json(employee))
        .catch(next);
}

function _delete(req, res, next) {
    employeeService.delete(req.params.id)
        .then(() => res.json({ message: 'Employee deleted successfully' }))
        .catch(next);
}

function transferDepartment(req, res, next) {
    employeeService.transferDepartment(req.params.id, req.body)
        .then(employee => res.json(employee))
        .catch(next);
} 