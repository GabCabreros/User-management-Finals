const express = require('express');
const router = express.Router();
const Joi = require('joi');
const validateRequest = require('../_middleware/validate-request');
const authorize = require('../_middleware/authorize');
const Role = require('../_helpers/role');
const requestService = require('./request.service');

// Routes
router.get('/', authorize(), getAll);
router.get('/account/:accountId', authorize(), getAllByAccount);
router.get('/:id', authorize(), getById);
router.post('/', authorize(), createSchema, create);
router.put('/:id', authorize(), updateSchema, update);
router.delete('/:id', authorize(Role.Admin), _delete);

module.exports = router;

// Schema validation
function createSchema(req, res, next) {
    const schema = Joi.object({
        accountId: Joi.number().required(),
        type: Joi.string().valid('Equipment', 'Leave', 'Resources', 'Other').required(),
        title: Joi.string().required(),
        description: Joi.string().allow(null, ''),
        items: Joi.array().items(
            Joi.object({
                name: Joi.string().required(),
                description: Joi.string().allow(null, ''),
                quantity: Joi.number().integer().min(1).default(1)
            })
        ).min(1).required(),
        createdBy: Joi.number().required()
    });
    validateRequest(req, next, schema);
}

function updateSchema(req, res, next) {
    const schema = Joi.object({
        type: Joi.string().valid('Equipment', 'Leave', 'Resources', 'Other'),
        title: Joi.string(),
        description: Joi.string().allow(null, ''),
        status: Joi.string().valid('Pending', 'Approved', 'Rejected', 'Completed'),
        items: Joi.array().items(
            Joi.object({
                id: Joi.number(),
                name: Joi.string().required(),
                description: Joi.string().allow(null, ''),
                quantity: Joi.number().integer().min(1),
                status: Joi.string().valid('Pending', 'Approved', 'Rejected', 'Completed')
            })
        ),
        updatedBy: Joi.number().required()
    });
    validateRequest(req, next, schema);
}

// Route handlers
function getAll(req, res, next) {
    // Admin can see all requests, users can only see their own
    if (req.user.role !== Role.Admin) {
        return getAllByAccount(req, res, next);
    }
    
    requestService.getAll()
        .then(requests => res.json(requests))
        .catch(next);
}

function getAllByAccount(req, res, next) {
    const accountId = req.params.accountId || req.user.sub;
    
    // Users can only see their own requests
    if (req.params.accountId && Number(accountId) != req.user.sub && req.user.role !== Role.Admin) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
    
    requestService.getAllByAccount(accountId)
        .then(requests => res.json(requests))
        .catch(next);
}

function getById(req, res, next) {
    requestService.getById(req.params.id)
        .then(request => {
            // Users can only see their own requests
            if (request.accountId != req.user.sub && req.user.role !== Role.Admin) {
                return res.status(401).json({ message: 'Unauthorized' });
            }
            res.json(request);
        })
        .catch(next);
}

function create(req, res, next) {
    // Set account ID to current user if not admin
    if (req.user.role !== Role.Admin) {
        req.body.accountId = req.user.sub;
    }
    
    // Set created by to current user
    req.body.createdBy = req.user.sub;
    
    requestService.create(req.body)
        .then(request => res.json(request))
        .catch(next);
}

function update(req, res, next) {
    requestService.getById(req.params.id)
        .then(request => {
            // Users can only update their own requests
            if (request.accountId != req.user.sub && req.user.role !== Role.Admin) {
                return res.status(401).json({ message: 'Unauthorized' });
            }
            
            // Users can only update pending requests
            if (request.status !== 'Pending' && req.user.role !== Role.Admin) {
                return res.status(400).json({ message: 'Cannot update request that is not pending' });
            }
            
            // Set updated by to current user
            req.body.updatedBy = req.user.sub;
            
            requestService.update(req.params.id, req.body)
                .then(updatedRequest => res.json(updatedRequest))
                .catch(next);
        })
        .catch(next);
}

function _delete(req, res, next) {
    requestService.delete(req.params.id)
        .then(() => res.json({ message: 'Request deleted successfully' }))
        .catch(next);
} 