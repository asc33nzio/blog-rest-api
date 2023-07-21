const router = require('express').Router();
const { authControllers } = require('../controllers');
const { checkRegister, checkLoginAll, checkPasswordLogin, checkPasswordReset } = require('../middleware/validator');

router.post('/register', checkRegister, authControllers.register);
router.post('/login', checkLoginAll, checkPasswordLogin, authControllers.login);
router.patch('/verification/:token', authControllers.verifyAccount);
router.patch('/verifyNewEmail/:token', authControllers.verifyNewEmail);
router.post('/reset_password_request', authControllers.resetPasswordRequest);
router.patch('/reset_password/:token', checkPasswordReset, authControllers.resetPassword);

module.exports = router;