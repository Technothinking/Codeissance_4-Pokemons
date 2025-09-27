const express = require('express');
const {
    createStaff,
    getStaff,
    getBusinessStaff,
    updateStaff,
    deleteStaff,
    updateAvailability,
    requestTimeOff,
    updateTimeOffRequest
} = require('../controllers/staffController');

const { protect, authorize, authorizeBusinessOwner, authorizeStaffAccess } = require('../middleware/auth');
const { validateStaff, validateObjectId, validatePagination } = require('../middleware/validation');

const router = express.Router();

// Protect all staff routes
router.use(protect);

// Create staff member under a business
router.post('/business/:businessId', validateObjectId('businessId'), authorizeBusinessOwner, validateStaff, createStaff);

// Get staff list for a business
router.get('/business/:businessId', validateObjectId('businessId'), authorizeStaffAccess, validatePagination, getBusinessStaff);

// Staff CRUD
router.get('/:id', validateObjectId('id'), authorizeStaffAccess, getStaff);
router.put('/:id', validateObjectId('id'), authorizeBusinessOwner, validateStaff, updateStaff);
router.delete('/:id', validateObjectId('id'), authorizeBusinessOwner, deleteStaff);

// Update staff availability
router.put('/:id/availability', validateObjectId('id'), authorizeStaffAccess, updateAvailability);

// Staff time off requests
router.post('/:id/time-off', validateObjectId('id'), authorizeStaffAccess, requestTimeOff);
router.put('/:staffId/time-off/:requestId', validateObjectId('staffId'), validateObjectId('requestId'), authorizeBusinessOwner, updateTimeOffRequest);

module.exports = router;
