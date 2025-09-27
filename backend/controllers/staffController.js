const Staff = require('../models/Staff');
const User = require('../models/User');
const Business = require('../models/Business');

// Create new staff member
const createStaff = async (req, res) => {
  try {
    const data = { ...req.body, businessId: req.params.businessId };
    const business = await Business.findById(req.params.businessId);
    if (!business)
      return res.status(404).json({ success: false, message: 'Business not found' });

    const activeStaffCount = await Staff.countDocuments({ businessId: req.params.businessId, isActive: true });
    if (activeStaffCount >= business.subscription.maxStaff)
      return res.status(400).json({ success: false, message: 'Staff limit reached for subscription' });

    const existing = await Staff.findOne({ phone: data.phone, businessId: data.businessId });
    if (existing)
      return res.status(400).json({ success: false, message: 'Staff with this phone already exists' });

    const staff = await Staff.create(data);
    res.status(201).json({ success: true, message: 'Staff created', data: { staff } });
  } catch (error) {
    console.error('CreateStaff error:', error);
    res.status(500).json({ success: false, message: 'Server error creating staff' });
  }
};

// Get staff list of a business
const getBusinessStaff = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, role, status } = req.query;
    const query = { businessId: req.params.businessId };

    if (search) {
      query.$or = [
        { name: new RegExp(search, 'i') },
        { email: new RegExp(search, 'i') },
        { phone: new RegExp(search, 'i') }
      ];
    }
    if (role) query.roles = role;
    if (status) query.isActive = status === 'active';

    const staffs = await Staff.find(query)
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await Staff.countDocuments(query);

    res.json({
      success: true,
      data: { staff: staffs, pagination: { page, limit, total, pages: Math.ceil(total / limit) } }
    });
  } catch (error) {
    console.error('GetBusinessStaff error:', error);
    res.status(500).json({ success: false, message: 'Server error fetching staff' });
  }
};

// Get individual staff member
const getStaff = async (req, res) => {
  try {
    const staff = await Staff.findById(req.params.id).populate('userId', 'name email');
    if (!staff)
      return res.status(404).json({ success: false, message: 'Staff not found' });

    res.json({ success: true, data: { staff } });
  } catch (error) {
    console.error('GetStaff error:', error);
    res.status(500).json({ success: false, message: 'Server error fetching staff' });
  }
};

// Update staff member data
const updateStaff = async (req, res) => {
  try {
    const staff = await Staff.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!staff)
      return res.status(404).json({ success: false, message: 'Staff not found' });

    res.json({ success: true, message: 'Staff updated', data: { staff } });
  } catch (error) {
    console.error('UpdateStaff error:', error);
    res.status(500).json({ success: false, message: 'Server error updating staff' });
  }
};

// Deactivate staff member (soft delete)
const deleteStaff = async (req, res) => {
  try {
    const staff = await Staff.findById(req.params.id);
    if (!staff)
      return res.status(404).json({ success: false, message: 'Staff not found' });

    staff.isActive = false;
    await staff.save();

    res.json({ success: true, message: 'Staff deactivated' });
  } catch (error) {
    console.error('DeleteStaff error:', error);
    res.status(500).json({ success: false, message: 'Server error deleting staff' });
  }
};

// Update staff availability
const updateAvailability = async (req, res) => {
  try {
    const staff = await Staff.findByIdAndUpdate(req.params.id, { availability: req.body.availability }, { new: true, runValidators: true });
    if (!staff)
      return res.status(404).json({ success: false, message: 'Staff not found' });

    res.json({ success: true, message: 'Availability updated', data: { staff } });
  } catch (error) {
    console.error('UpdateAvailability error:', error);
    res.status(500).json({ success: false, message: 'Server error updating availability' });
  }
};

// Request time off
const requestTimeOff = async (req, res) => {
  try {
    const staff = await Staff.findById(req.params.id);
    if (!staff)
      return res.status(404).json({ success: false, message: 'Staff not found' });

    staff.timeOffRequests.push({ 
      startDate: req.body.startDate, 
      endDate: req.body.endDate, 
      reason: req.body.reason,
      status: 'pending' 
    });

    await staff.save();

    res.json({ success: true, message: 'Time off requested', data: { staff } });
  } catch (error) {
    console.error('RequestTimeOff error:', error);
    res.status(500).json({ success: false, message: 'Server error requesting time off' });
  }
};

// Approve or reject time off request
const updateTimeOffRequest = async (req, res) => {
  try {
    const staff = await Staff.findById(req.params.staffId);
    if (!staff)
      return res.status(404).json({ success: false, message: 'Staff not found' });

    const request = staff.timeOffRequests.id(req.params.requestId);
    if (!request)
      return res.status(404).json({ success: false, message: 'Time off request not found' });

    request.status = req.body.status;
    await staff.save();

    res.json({ success: true, message: `Time off request ${req.body.status}`, data: { staff } });
  } catch (error) {
    console.error('UpdateTimeOffRequest error:', error);
    res.status(500).json({ success: false, message: 'Server error updating time off request' });
  }
};

module.exports = {
  createStaff,
  getBusinessStaff,
  getStaff,
  updateStaff,
  deleteStaff,
  updateAvailability,
  requestTimeOff,
  updateTimeOffRequest
};
