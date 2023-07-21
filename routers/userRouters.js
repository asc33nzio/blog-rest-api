const router = require('express').Router();
const { userControllers } = require('../controllers');
const { verifyToken, checkRole } = require('../middleware/auth');
const { multerUpload } = require('../middleware/multer');
const { checkVerification, checkUsername, checkEmail, checkPhone, checkPasswordChange } = require('../middleware/validator');
const { rateLimiter } = require('../middleware/rateLimiter')

router.get('/getAllUsers', verifyToken, checkVerification, checkRole, userControllers.getAllUsers);
router.get('/keepLogin', verifyToken, userControllers.keepLogin);
router.post('/uploadAvatar', verifyToken, checkVerification, multerUpload('./public/avatars', 'UserAvatar').single('file'), userControllers.uploadAvatar);
router.patch('/makeAdmin', verifyToken, checkVerification, userControllers.makeAdmin);
router.patch('/changeUsername', verifyToken, checkVerification, checkUsername, userControllers.changeUsername);
router.patch('/changeEmail', verifyToken, checkVerification, checkEmail, userControllers.changeEmail);
router.patch('/changePhone', verifyToken, checkVerification, checkPhone, userControllers.changePhone);
router.patch('/changePassword', verifyToken, checkVerification, checkPasswordChange, userControllers.changePassword);
router.post('/writeArticle', verifyToken, checkVerification, rateLimiter, multerUpload('./public/articles', 'ArticleIMG').single('file'), userControllers.writeArticle);
router.put('/createNewCategory', verifyToken, checkVerification, checkRole, userControllers.createNewCategory);
router.get('/userCreatedArticles', verifyToken, checkVerification, userControllers.userCreatedArticles);
router.get('/userLikedArticles', verifyToken, checkVerification, userControllers.userLikedArticles);
router.delete('/deleteArticle/:id', verifyToken, checkVerification, userControllers.deleteArticle);
router.post('/likeArticle/:id', verifyToken, checkVerification, userControllers.likeArticle);
router.delete('/unlikeArticle/:id', verifyToken, checkVerification, userControllers.unlikeArticle);

module.exports = router;