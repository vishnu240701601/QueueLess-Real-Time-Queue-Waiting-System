const express = require('express');
const router = express.Router();
const tokenController = require('../controllers/tokenController');
const { authenticate } = require('../middleware/auth');

// All token operations require authenticated student, staff, or admin session
router.use(authenticate);

router.post('/', tokenController.createToken);
router.get('/mine', tokenController.getMyTokens);
router.get('/:id', tokenController.getTokenById);
router.post('/:id/cancel', tokenController.cancelToken);
router.get('/:id/position', tokenController.getTokenPosition);

module.exports = router;
