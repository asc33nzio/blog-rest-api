const router = require('express').Router();
const { basicControllers } = require('../controllers');

router.get('/getAllArticles', basicControllers.getAllArticles);
router.get('/getMostLikes', basicControllers.getMostLikes);
router.get('/getAllCategories', basicControllers.getAllCategories);
router.get('/getAllKeywords', basicControllers.getAllKeywords);
router.get('/blog/:id', basicControllers.getBlog);
router.get('/public/avatars/:filename', basicControllers.getAvatar);
router.get('/public/avatars/', (req, res) => {
    res.status(400).send({
      status: 400,
      message: 'Image name cannot be empty.',
    });
  });
router.get('/public/articles/:filename', basicControllers.getArticleImage);
router.get('/public/articles/', (req, res) => {
    res.status(400).send({
      status: 400,
      message: 'Image name cannot be empty.',
    });
  });

module.exports = router;