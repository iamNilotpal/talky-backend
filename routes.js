const router = require('express').Router();
const authController = require('./controllers/auth-controller');
const activateController = require('./controllers/activate-controller');
const authMiddleware = require('./middlewares/auth-middleware');

router.post('/send-otp', authController.sendOTP);
router.post('/verify-otp', authController.verifyOTP);
router.get('/refresh-tokens', authController.refreshToken);
router.post('/activate', authMiddleware, activateController.activateUser);
router.post('/logout', authMiddleware, authController.logout);

module.exports = router;
