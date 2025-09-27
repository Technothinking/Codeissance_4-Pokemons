const Business = require('../models/Business');
const User = require('../models/User');

// Create a new business
const createBusiness = async (req, res) => {
  try {
    const data = { ...req.body, owner: req.user._id };
    const business = await Business.create(data);

    // Link business to user
    await User.findByIdAndUpdate(req.user._id, { businessId: business._id });

    res.status(201).json({
      success: true,
      message: 'Business created successfully',
      data: { business }
    });
  } catch (error) {
    console.error('CreateBusiness error:', error);
    res.status(500).json({ success: false, message: 'Server error creating business' });
  }
};

// Get business details by ID
const getBusiness = async (req, res) => {
  try {
    const business = await Business.findById(req.params.id).populate('owner', 'name email');
    if (!business)
      return res.status(404).json({ success: false, message: 'Business not found' });
    res.json({ success: true, data: { business } });
  } catch (error) {
    console.error('GetBusiness error:', error);
    res.status(500).json({ success: false, message: 'Server error fetching business' });
  }
};

// Update business by ID
const updateBusiness = async (req, res) => {
  try {
    const business = await Business.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!business)
      return res.status(404).json({ success: false, message: 'Business not found' });
    res.json({ success: true, message: 'Business updated', data: { business } });
  } catch (error) {
    console.error('UpdateBusiness error:', error);
    res.status(500).json({ success: false, message: 'Server error updating business' });
  }
};

// Add a role to business
const addRole = async (req, res) => {
  try {
    const business = await Business.findById(req.params.id);
    if (!business)
      return res.status(404).json({ success: false, message: 'Business not found' });

    business.roles.push(req.body);
    await business.save();

    res.json({ success: true, message: 'Role added', data: { business } });
  } catch (error) {
    console.error('AddRole error:', error);
    res.status(500).json({ success: false, message: 'Server error adding role' });
  }
};

// Update role by ID
const updateRole = async (req, res) => {
  try {
    const business = await Business.findById(req.params.id);
    if (!business)
      return res.status(404).json({ success: false, message: 'Business not found' });

    const role = business.roles.id(req.params.roleId);
    if (!role)
      return res.status(404).json({ success: false, message: 'Role not found' });

    Object.assign(role, req.body);
    await business.save();

    res.json({ success: true, message: 'Role updated', data: { business } });
  } catch (error) {
    console.error('UpdateRole error:', error);
    res.status(500).json({ success: false, message: 'Server error updating role' });
  }
};

// Delete role by ID (soft delete could also be implemented)
const deleteRole = async (req, res) => {
  try {
    const business = await Business.findById(req.params.id);
    if (!business)
      return res.status(404).json({ success: false, message: 'Business not found' });

    business.roles.id(req.params.roleId).remove();
    await business.save();

    res.json({ success: true, message: 'Role deleted', data: { business } });
  } catch (error) {
    console.error('DeleteRole error:', error);
    res.status(500).json({ success: false, message: 'Server error deleting role' });
  }
};

module.exports = {
  createBusiness,
  getBusiness,
  updateBusiness,
  addRole,
  updateRole,
  deleteRole
};
