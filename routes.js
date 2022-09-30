const router = require('express').Router();

const authMiddleware = require('./middlewares/auth-middleware');
const authController = require('./controllers/auth-controller');
const activateController = require('./controllers/activate-controller');
const roomController = require('./controllers/room-controller');
const userController = require('./controllers/user-controller');

// AUTHENTICATION
router.post('/send-otp', authController.sendOTP);
router.post('/verify-otp', authController.verifyOTP);
router.get('/refresh-tokens', authController.refreshToken);
router.post('/logout', authMiddleware, authController.logout);

// ACTIVATION
router.post('/activate', authMiddleware, activateController.activateUser);

// ROOMS
router.get('/rooms', authMiddleware, roomController.getAllRooms);
router.get('/room/:id', authMiddleware, roomController.getRoom);
router.post('/rooms', authMiddleware, roomController.createRoom);

// USER
router.patch('/user/info', authMiddleware, userController.updatePersonalInfo);
router.patch('/user/avatar', authMiddleware, userController.updateAvatar);
router.delete(
  '/user/delete-account',
  authMiddleware,
  userController.deleteAccount,
);

module.exports = router;
