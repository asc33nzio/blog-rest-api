const db = require('../models');
const user = db.User;
const articles = db.Articles;
const categories = db.Categories;
const keywords = db.Keywords;
const { Op } = require('sequelize');

module.exports = {
    getAllArticles: async (req, res) => {
        try {
            const { pageSize = 10, currentPage = 1, category, title, sort = 'DESC', keywords, author, country, content } = req.query;
            const totalArticles = await articles.count();
            const totalPages = Math.ceil(totalArticles / pageSize);

            const options = {
                where: {},
                order: [['createdAt', sort.toUpperCase()]],
                limit: Math.ceil(parseInt(pageSize)),
                offset: Math.ceil((parseInt(currentPage) - 1) * parseInt(pageSize))
            };

            if (category) {
                options.where.category = category;
            };

            if (title) {
                options.where.title = { [Op.like]: `%${title}%` };
            };

            if (keywords) {
                options.where.keywords = { [Op.like]: `%${keywords}%` };
            };

            if (author) {
                options.where.author = { [Op.like]: `%${author}%` };
            };

            if (country) {
                options.where.country = { [Op.like]: `%${country}%` };
            };

            if (content) {
                options.where.content = { [Op.like]: `%${content}%` };
            };

            if (sort === 'newest') {
                options.order = [['createdAt', 'DESC']];
            } else if (sort === 'NEWEST') {
                options.order = [['createdAt', 'DESC']];
            } else if (sort === 'oldest') {
                options.order = [['createdAt', 'ASC']];
            } else if (sort === 'OLDEST') {
                options.order = [['createdAt', 'ASC']];
            };

            const result = await articles.findAll(options);

            const reorderedResult = result.map(article => {
                const {
                    imgURL,
                    videoURL,
                    category,
                    content,
                    country,
                    authorId,
                    likedBy,
                    createdAt,
                    updatedAt,
                    categoryId,
                    publish,
                    users_that_liked,
                    likeCount,
                    keywords,
                    ...articleData
                } = article.toJSON();

                return {
                    ...articleData,
                    authorId,
                    category,
                    categoryId,
                    content,
                    country,
                    imgURL,
                    videoURL,
                    createdAt,
                    publish,
                    updatedAt,
                    likeCount,
                    likedBy,
                    users_that_liked,
                    keywords,
                };
            });

            res.status(200).send({
                status: 200,
                totalArticles: parseInt(totalArticles),
                totalPages,
                currentPage: parseInt(currentPage),
                pageSize: parseInt(pageSize),
                result: reorderedResult
            });
        } catch (error) {
            res.status(500).send({
                status: 500,
                message: error
            });
        }
    },
    getMostLikes: async (req, res) => {
        try {
            const { pageSize = 10, currentPage = 1, sort = 'DESC' } = req.query;
            const totalArticles = await articles.count();
            const totalPages = Math.ceil(totalArticles / pageSize);

            const options = {
                where: {},
                order: [['likeCount', sort.toUpperCase()]],
                limit: Math.ceil(parseInt(pageSize)),
                offset: Math.ceil((parseInt(currentPage) - 1) * parseInt(pageSize))
            };

            if (sort === 'most') {
                options.order = [['likeCount', 'DESC']];
            } else if (sort === 'MOST') {
                options.order = [['likeCount', 'DESC']];
            } else if (sort === 'least') {
                options.order = [['likeCount', 'ASC']];
            } else if (sort === 'LEAST') {
                options.order = [['likeCount', 'ASC']];
            };

            const result = await articles.findAll(options);

            const reorderedResult = result.map(article => {
                const {
                    imgURL,
                    videoURL,
                    category,
                    content,
                    country,
                    authorId,
                    likedBy,
                    createdAt,
                    updatedAt,
                    categoryId,
                    publish,
                    users_that_liked,
                    likeCount,
                    keywords,
                    ...articleData
                } = article.toJSON();

                return {
                    ...articleData,
                    authorId,
                    category,
                    categoryId,
                    content,
                    country,
                    imgURL,
                    videoURL,
                    createdAt,
                    publish,
                    updatedAt,
                    likeCount,
                    likedBy,
                    users_that_liked,
                    keywords,
                };
            });

            res.status(200).send({
                status: 200,
                totalArticles: parseInt(totalArticles),
                totalPages,
                currentPage: parseInt(currentPage),
                pageSize: parseInt(pageSize),
                result: reorderedResult
            });
        } catch (error) {
            res.status(500).send({
                status: 500,
                message: error
            });
        }
    },
    getAllCategories: async (req, res) => {
        try {
            const result = await categories.findAll();
            res.status(200).send({
                status: 200,
                result
            });
        } catch (error) {
            res.status(400).send({
                status: 400,
                message: error
            });
        }
    },
    getBlog: async (req, res) => {
        try {
            const articleId = req.params.id;
            const result = await articles.findOne({
                where: {
                    id: articleId
                }
            });

            if (!result) {
                res.status(400).send({
                    status: 404,
                    message: "Article not found. Please refer to a valid article ID."
                });
            } else {
                const {
                    imgURL,
                    videoURL,
                    category,
                    content,
                    country,
                    authorId,
                    likedBy,
                    createdAt,
                    updatedAt,
                    categoryId,
                    publish,
                    users_that_liked,
                    likeCount,
                    keywords,
                    ...articleData
                } = result.toJSON();

                const reorderedResult = {
                    ...articleData,
                    authorId,
                    category,
                    categoryId,
                    content,
                    country,
                    imgURL,
                    videoURL,
                    createdAt,
                    publish,
                    updatedAt,
                    likeCount,
                    likedBy,
                    users_that_liked,
                    keywords
                };

                res.status(200).send({
                    status: 200,
                    [`article_${articleId}`]: reorderedResult
                });
            };
        } catch (error) {
            res.status(400).send({
                status: 400,
                message: error
            });
        }
    },
    getAvatar: async (req, res) => {
        try {
            const { filename } = req.params;
            const dirname = "D:/Purwadhika/Back_End/minpro_amadeo/"
            const filePath = `${dirname}public/avatars/${filename}`;

            if (!filename || filename.trim() === "") {
                return res.status(400).send({
                    status: 404,
                    message: "Add a valid image name."
                });
            };

            const userAvatar = await user.findOne({ where: { avatar: filename } });
            if (!userAvatar) {
                return res.status(400).send({
                    status: 404,
                    message: "Avatar not found in the database."
                });
            };

            res.sendFile(filePath);
        } catch (error) {
            res.status(500).send({
                status: 500,
                message: error
            });
        }
    },
    getArticleImage: async (req, res) => {
        try {
            const { filename } = req.params;
            const dirname = "D:/Purwadhika/Back_End/minpro_amadeo/"
            const filePath = `${dirname}public/articles/${filename}`;

            if (!filename || filename.trim() === "") {
                return res.status(400).send({
                    status: 404,
                    message: "Add a valid image name."
                });
            };

            const articleImage = await articles.findOne({ where: { imgURL: filename } });
            if (!articleImage) {
                return res.status(400).send({
                    status: 404,
                    message: "Article image not found in the database."
                });
            };

            res.sendFile(filePath);
        } catch (error) {
            res.status(500).send({
                status: 500,
                message: error
            });
        }
    },
    getAllKeywords: async (req, res) => {
        try {
            const result = await keywords.findAll();
            const keywordCount = await keywords.count(); 
            res.status(200).send({
                status: 200,
                total_keywords: keywordCount,
                result
            });
        } catch (error) {
            res.status(400).send({
                status: 400,
                message: error
            });
        }
    },
};