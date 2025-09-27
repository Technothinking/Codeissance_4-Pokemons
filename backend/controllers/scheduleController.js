const Schedule = require('../models/Schedule');
const Staff = require('../models/Staff');
const Business = require('../models/Business');
const aiService = require('../services/aiService');
const moment = require('moment-timezone');

const generateSchedule = async (req, res) => {
  try {
    const businessId = req.params.businessId;
    const { weekStartDate, weekEndDate, title, requirements } = req.body;

    const business = await Business.findById(businessId);
    if (!business) return res.status(404).json({ success: false, message: 'Business not found' });

    const currentMonthSchedules = await Schedule.countDocuments({
      businessId,
      createdAt: { $gte: moment().startOf('month').toDate(), $lte: moment().endOf('month').toDate() }
    });

    if (currentMonthSchedules >= business.subscription.maxSchedules)
      return res.status(400).json({ success: false, message: 'Schedule limit reached' });

    const staff = await Staff.find({ businessId, isActive: true });
    if (!staff.length) return res.status(400).json({ success: false, message: 'No active staff' });

    const aiResult = await aiService.generateSchedule(
      { business, businessHours: business.businessHours, roles: business.roles, constraints: business.constraints },
      staff,
      { weekStartDate, weekEndDate, requirements }
    );

    if (!aiResult.success) {
      const fallbackSchedule = new Schedule({
        businessId,
        title: title || `Schedule ${weekStartDate} - ${weekEndDate}`,
        weekStartDate,
        weekEndDate,
        shifts: aiResult.fallback.schedule,
        aiGenerated: false,
        status: 'draft',
      });
      await fallbackSchedule.save();
      return res.json({ success: true, message: 'Fallback schedule generated', schedule: fallbackSchedule, warnings: aiResult.fallback.warnings });
    }

    const schedule = new Schedule({
      businessId,
      title: title || `Schedule ${weekStartDate} - ${weekEndDate}`,
      weekStartDate,
      weekEndDate,
      shifts: aiResult.schedule,
      aiGenerated: true,
      status: 'draft',
      aiRecommendations: aiResult.recommendations,
    });

    await schedule.save();

    res.json({ success: true, message: 'Schedule generated', schedule, aiMetrics: aiResult.metrics, warnings: aiResult.warnings });
  } catch (error) {
    console.error('GenerateSchedule error:', error);
    res.status(500).json({ success: false, message: 'Server error generating schedule' });
  }
};

const getBusinessSchedules = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, startDate, endDate } = req.query;
    const query = { businessId: req.params.businessId };
    if (status) query.status = status;
    if (startDate && endDate) query.weekStartDate = { $gte: new Date(startDate), $lte: new Date(endDate) };

    const schedules = await Schedule.find(query)
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .sort({ weekStartDate: -1 });

    const total = await Schedule.countDocuments(query);

    res.json({ success: true, data: { schedules, pagination: { page, limit, total, pages: Math.ceil(total / limit) } } });
  } catch (error) {
    console.error('GetBusinessSchedules error:', error);
    res.status(500).json({ success: false, message: 'Server error fetching schedules' });
  }
};

const getSchedule = async (req, res) => {
  try {
    const schedule = await Schedule.findById(req.params.id)
      .populate('businessId', 'name timezone')
      .populate('shifts.staffId', 'name roles');
    if (!schedule) return res.status(404).json({ success: false, message: 'Schedule not found' });
    res.json({ success: true, data: { schedule } });
  } catch (error) {
    console.error('GetSchedule error:', error);
    res.status(500).json({ success: false, message: 'Server error fetching schedule' });
  }
};

const updateSchedule = async (req, res) => {
  try {
    const schedule = await Schedule.findById(req.params.id);
    if (!schedule) return res.status(404).json({ success: false, message: 'Schedule not found' });

    const modification = {
      modifiedBy: req.user._id,
      changes: [],
      reason: req.body.reason || 'Manual update',
      modifiedAt: new Date(),
    };

    for (const key of Object.keys(req.body)) {
      if (key !== 'reason' && schedule[key] !== req.body[key]) {
        modification.changes.push({ field: key, oldValue: schedule[key], newValue: req.body[key] });
      }
    }

    Object.assign(schedule, req.body);
    schedule.modifications.push(modification);

    await schedule.save();

    res.json({ success: true, message: 'Schedule updated', data: { schedule } });
  } catch (error) {
    console.error('UpdateSchedule error:', error);
    res.status(500).json({ success: false, message: 'Server error updating schedule' });
  }
};

const publishSchedule = async (req, res) => {
  try {
    const schedule = await Schedule.findById(req.params.id);
    if (!schedule) return res.status(404).json({ success: false, message: 'Schedule not found' });

    schedule.status = 'published';
    schedule.publishedAt = new Date();

    await schedule.save();

    // TODO: send notifications

    res.json({ success: true, message: 'Schedule published', data: { schedule } });
  } catch (error) {
    console.error('PublishSchedule error:', error);
    res.status(500).json({ success: false, message: 'Server error publishing schedule' });
  }
};

const deleteSchedule = async (req, res) => {
  try {
    const schedule = await Schedule.findById(req.params.id);
    if (!schedule) return res.status(404).json({ success: false, message: 'Schedule not found' });
    if (schedule.status === 'published') return res.status(400).json({ success: false, message: 'Cannot delete published schedule' });

    await schedule.remove();

    res.json({ success: true, message: 'Schedule deleted' });
  } catch (error) {
    console.error('DeleteSchedule error:', error);
    res.status(500).json({ success: false, message: 'Server error deleting schedule' });
  }
};

const getStaffSchedule = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const query = {
      status: { $in: ['published', 'completed'] },
      'shifts.staffId': req.params.staffId,
    };
    if (startDate && endDate) query.weekStartDate = { $gte: new Date(startDate), $lte: new Date(endDate) };

    const schedules = await Schedule.find(query).sort({ weekStartDate: -1 });

    const filteredSchedules = schedules.map(schedule => ({
      ...schedule.toObject(),
      shifts: schedule.shifts.filter(shift => shift.staffId.toString() === req.params.staffId),
    }));

    res.json({ success: true, data: { schedules: filteredSchedules } });
  } catch (error) {
    console.error('GetStaffSchedule error:', error);
    res.status(500).json({ success: false, message: 'Server error fetching staff schedule' });
  }
};

module.exports = {
  generateSchedule,
  getBusinessSchedules,
  getSchedule,
  updateSchedule,
  publishSchedule,
  deleteSchedule,
  getStaffSchedule,
};
