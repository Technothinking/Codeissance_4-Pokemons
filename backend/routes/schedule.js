const express = require('express');
const {
  generateSchedule,
  getBusinessSchedules,
  getSchedule,
  updateSchedule,
  publishSchedule,
  deleteSchedule,
  getStaffSchedule
} = require('../controllers/scheduleController');

const { protect, authorize, authorizeBusinessOwner, authorizeStaffAccess } = require('../middleware/auth');
const { validateSchedule, validateObjectId, validatePagination } = require('../middleware/validation');

const router = express.Router();

router.use(protect);

router.post('/business/:businessId/generate', validateObjectId('businessId'), authorizeBusinessOwner, validateSchedule, generateSchedule);

router.get('/business/:businessId', validateObjectId('businessId'), authorizeStaffAccess, validatePagination, getBusinessSchedules);

router.get('/:id', validateObjectId('id'), authorizeStaffAccess, getSchedule);

router.put('/:id', validateObjectId('id'), authorizeBusinessOwner, updateSchedule);

router.post('/:id/publish', validateObjectId('id'), authorizeBusinessOwner, publishSchedule);

router.delete('/:id', validateObjectId('id'), authorizeBusinessOwner, deleteSchedule);

router.get('/staff/:staffId', validateObjectId('staffId'), authorizeStaffAccess, getStaffSchedule);

module.exports = router;
