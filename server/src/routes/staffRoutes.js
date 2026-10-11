const express = require('express');
const router = express.Router();
const staffController = require('../controllers/staffController');
const { authenticate } = require('../middleware/auth');
const { requireRole } = require('../middleware/roles');

// All staff operations require authentication and staff or admin role
router.use(authenticate);
router.use(requireRole('staff', 'admin'));

// Token operational actions
router.post('/tokens/:id/call', staffController.callToken);
router.post('/services/:serviceId/call-next', staffController.callNextInQueue);
router.post('/tokens/:id/start', staffController.startService);
router.post('/tokens/:id/complete', staffController.completeService);
router.post('/tokens/:id/skip', staffController.skipToken);

module.exports = router;
