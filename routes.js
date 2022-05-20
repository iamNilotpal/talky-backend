const router = require('express').Router();
const authController = require('./controllers/auth-controller');
const activateController = require('./controllers/activate-controller');
const authMiddleware = require('./middlewares/auth-middleware');
const roomController = require('./controllers/room-controller');

router.post('/send-otp', authController.sendOTP);
router.post('/verify-otp', authController.verifyOTP);
router.get('/refresh-tokens', authController.refreshToken);
router.post('/activate', authMiddleware, activateController.activateUser);
router.post('/logout', authMiddleware, authController.logout);
router.get('/rooms', authMiddleware, roomController.getAllRooms);
router.post('/rooms', authMiddleware, roomController.createRoom);

module.exports = router;
