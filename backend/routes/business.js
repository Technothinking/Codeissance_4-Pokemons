const express = require('express');
const {
    createBusiness,
    getBusiness,
    updateBusiness,
    addRole,
    updateRole,
    deleteRole
} = require('../controllers/businessController');

const { protect, authorize, authorizeBusinessOwner } = require('../middleware/auth');
const { validateBusiness, validateObjectId } = require('../middleware/validation');

const router = express.Router();

// Apply authentication middleware to all routes
router.use(protect);

// Business routes
router.post('/', authorize('business_owner'), validateBusiness, createBusiness);
router.get('/:id', validateObjectId('id'), authorizeBusinessOwner, getBusiness);
router.put('/:id', validateObjectId('id'), authorizeBusinessOwner, validateBusiness, updateBusiness);

// Role management routes
router.post('/:id/roles', validateObjectId('id'), authorizeBusinessOwner, addRole);
router.put('/:id/roles/:roleId', validateObjectId('id'), authorizeBusinessOwner, updateRole);
router.delete('/:id/roles/:roleId', validateObjectId('id'), authorizeBusinessOwner, deleteRole);

module.exports = router;
