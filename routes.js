const router = require('express').Router();
const authController = require('./controllers/auth-controller');

router.post('/send-otp', authController.sendOTP);
router.post('/verify-otp', authController.verifyOTP);

module.exports = router;
