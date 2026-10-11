const express = require('express');
const router = express.Router();
const serviceController = require('../controllers/serviceController');
const { optionalAuthenticate } = require('../middleware/auth');

// Public / Authenticated service endpoints
router.get('/', serviceController.getServices);
router.get('/:id', serviceController.getServiceById);
router.get('/:id/queue', optionalAuthenticate, serviceController.getServiceQueue);

module.exports = router;
