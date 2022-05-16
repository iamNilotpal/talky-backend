const router = require('express').Router();
const authController = require('./controllers/auth-controller');
const activateController = require('./controllers/activate-controller');

router.post('/send-otp', authController.sendOTP);
router.post('/verify-otp', authController.verifyOTP);
router.post(
  '/activate',
  require('./middlewares/auth-middleware'),
  activateController.activateUser
);
router.post('/refresh-token', authController.refreshToken);

module.exports = router;
