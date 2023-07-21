const router = require('express').Router();
const { basicControllers } = require('../controllers');
const db = require('../models');
const articles = db.Articles;

router.get('/getAllArticles', basicControllers.getAllArticles);
router.get('/getMostLikes', basicControllers.getMostLikes);
router.get('/getAllCategories', basicControllers.getAllCategories);
router.get('/getAllKeywords', basicControllers.getAllKeywords);
router.get('/blog/:id', basicControllers.getBlog);
router.head('/blog/:id', async (req, res) => {
  const articleId = req.params.id;

  try {
    const article = await articles.findByPk(articleId);

    if (!article) {
      res.setHeader('X-ArticleExist', 'false');
      res.setHeader('Content-Length', '0');
      return res.status(404).end();
    };

    res.setHeader('X-ArticleExist', 'true');
    console.log(res.getHeaders());
    return res.status(200).end();
  } catch (error) {
    return res.status(500).end();
  };
});
router.get('/public/avatars/:filename', basicControllers.getAvatar);
router.get('/public/avatars/', (req, res) => {
  res.status(400).send({
    status: 404,
    message: 'Image name cannot be empty.',
  });
});
router.get('/public/articles/:filename', basicControllers.getArticleImage);
router.get('/public/articles/', (req, res) => {
  res.status(400).send({
    status: 404,
    message: 'Image name cannot be empty.',
  });
});

module.exports = router;