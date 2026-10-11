const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authenticate } = require('../middleware/auth');
const { requireRole } = require('../middleware/roles');

// All administrator endpoints strictly enforce admin role
router.use(authenticate);
router.use(requireRole('admin'));

// Service Counter Management
router.post('/services', adminController.createService);
router.patch('/services/:id', adminController.updateService);

// Campus Queue Analytics
router.get('/analytics', adminController.getAnalytics);

// Authorized Staff Assignments
router.get('/staff-assignments', adminController.getStaffAssignments);
router.post('/staff-assignments', adminController.createStaffAssignment);
router.delete('/staff-assignments/:id', adminController.deleteStaffAssignment);

module.exports = router;
