const db = require('../models');
const user = db.User;
const articles = db.Articles;
const likedArticles = db.LikedArticles;
const Keywords = db.Keywords;
const categories = db.Categories;
const countries = db.Countries;
const changeEmailRequest = db.ChangeEmailRequest;
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const transporter = require('../middleware/transporter');
const fs = require('fs');
const handlebars = require('handlebars');
const { v4: uuidv4 } = require('uuid');

module.exports = {
    getAllUsers: async (req, res) => {
        try {
            const result = await user.findAll();
            const userCount = await user.count();
            res.status(200).send({
                status: 200,
                total_SCP_users: userCount,
                result
            });
        } catch (error) {
            res.status(500).send({
                status: 500,
                message: error
            });
        }
    },
    uploadAvatar: async (req, res) => {
        try {
            // console.log(req.file);

            if (!req.file) {
                return res.status(400).send({
                    status: 404,
                    message: "Please attach an image. Only JPG, JPEG, PNG, WEBP, and GIF file formats below 1mb in size are allowed."
                });
            };

            if (req.file.size > 1 * 1024 * 1024) {
                return res.status(400).send({
                    status: 401,
                    message: "File size must not exceed 1Mb."
                });
            };

            if (req.user.isVerified === false) {
                return res.status(400).send({
                    status: 401,
                    message: "Please verify your account first."
                });
            };

            await user.update({
                avatar: req.file.filename
            }, {
                where: {
                    id: req.user.id
                }
            });

            res.status(200).send({
                status: 201,
                message: "Avatar Upload Successful."
            });
        } catch (error) {
            console.log(error);
            res.status(500).send({
                status: 500,
                message: error
            });
        }
    },
    makeAdmin: async (req, res) => {
        try {
            const { username, masterKey } = req.body;

            const findUser = await user.findOne({
                where: {
                    username: username
                }
            });

            if (!findUser) {
                throw { message: "User not found." }
            };

            if (findUser.isVerified === false) {
                throw { message: "Please verify your account first." }
            }; // actually a redundant process because tokenVerify is handled by middleware, but just for an enchanced security layer.

            if (masterKey !== process.env.MASTER_KEY) {
                throw { message: "Contact webmaster to become an administrator." }
            };

            if (findUser.isAdmin === true) {
                throw { message: "You are already an administrator in SCP." }
            }

            findUser.isAdmin = true;
            await findUser.save();

            res.status(200).send({
                status: 200,
                user: findUser,
                message: "You are now an administrator."
            });
        } catch (error) {
            console.log(error);
            res.status(400).send({
                status: 400,
                message: error
            });
        };
    },
    keepLogin: async (req, res) => {
        try {
            const token = req.headers.authorization.split(' ')[1];
            const decodeUser = jwt.verify(token, process.env.KEY_JWT);
            const userId = decodeUser.id;

            const findUserInfo = await user.findByPk(userId);

            if (!findUserInfo) {
                throw { message: "Token expired. Please login again before making another request." }
            };

            res.status(200).send({
                status: 200,
                findUserInfo
            });
        } catch (error) {
            res.status(400).send({
                status: 400,
                message: error
            });
        };
    },
    changeUsername: async (req, res) => {
        try {
            const { newUsername, confirmUsername } = req.body;

            const token = req.headers.authorization.split(' ')[1];
            const decodeUser = jwt.verify(token, process.env.KEY_JWT);
            const userId = decodeUser.id;

            const findUser = await user.findByPk(userId);

            if (!findUser) {
                throw { message: "Token expired. Please login again before making another request." }
            };

            const isUserExist = await user.findOne({
                where: { username: newUsername }
            });

            if (isUserExist) {
                throw {
                    message: "Username has been used."
                }
            };

            if (!confirmUsername) {
                throw {
                    message: "Username confirmation must not be empty."
                }
            };

            if (confirmUsername !== newUsername) {
                throw {
                    status: 400,
                    message: "Username confirmation does not match."
                };
            };

            findUser.username = newUsername;
            await findUser.save();

            const data = await fs.readFileSync('./template_change_username.html', 'utf-8');
            const tempCompile = await handlebars.compile(data);
            const tempResult = tempCompile({ username: newUsername });

            const html = tempResult;

            await transporter.sendMail({
                from: 'asc33nzio.dev@gmail.com',
                to: findUser.email,
                subject: 'SCP Username Change',
                html: html
            });

            res.status(200).send({
                status: 200,
                user: findUser,
                message: "Username change successful. Check your e-mail for confirmation."
            });

        } catch (error) {
            console.log(error);
            res.status(400).send({
                status: 400,
                message: error
            });
        };
    },
    changeEmail: async (req, res) => {
        try {
            const { newEmail, confirmEmail } = req.body;
            const token = req.headers.authorization.split(' ')[1];

            const decodeUser = jwt.verify(token, process.env.KEY_JWT);
            const userId = decodeUser.id;
            const findUser = await user.findByPk(userId);

            if (!findUser) {
                throw { message: "Token expired. Please login again before making another request." }
            };

            const isEmailExist = await user.findOne({
                where: { email: newEmail }
            });

            if (isEmailExist) {
                throw {
                    message: "E-mail has been used."
                }
            };

            if (!confirmEmail) {
                throw {
                    message: "E-mail confirmation must not be empty."
                }
            };

            if (confirmEmail !== newEmail) {
                throw {
                    status: 400,
                    message: "E-mail confirmation does not match."
                }
            };

            const reVerifyEmail = await changeEmailRequest.create({
                userId: findUser.id,
                token: uuidv4(),
                newEmail
            });

            findUser.email = newEmail;
            findUser.isVerified = false;
            await findUser.save();

            const data = await fs.readFileSync('./template_change_email.html', 'utf-8');
            const tempCompile = await handlebars.compile(data);
            const tempResult = tempCompile({ username: findUser.username });

            const htmlWithToken = tempResult.replace('TOKEN_PLACEHOLDER', reVerifyEmail.token);

            await transporter.sendMail({
                from: 'asc33nzio.dev@gmail.com',
                to: findUser.email,
                subject: 'SCP E-mail Address Change Verification',
                html: htmlWithToken
            });

            res.status(200).send({
                status: 200,
                user: findUser,
                message: "E-mail change initiated. Please check your new e-mail for verification."
            });

        } catch (error) {
            console.log(error);
            res.status(400).send({
                status: 400,
                message: error
            });
        };
    },
    changePhone: async (req, res) => {
        try {
            const { newPhone, confirmPhone } = req.body;

            const token = req.headers.authorization.split(' ')[1];

            const decodeUser = jwt.verify(token, process.env.KEY_JWT);
            const userId = decodeUser.id;

            const findUser = await user.findByPk(userId);

            if (!findUser) {
                throw { message: "Token expired. Please login again before making another request." }
            };

            const isPhoneExist = await user.findOne({
                where: { phone: newPhone }
            });

            if (isPhoneExist) {
                throw {
                    message: "Phone number has been used."
                }
            };

            if (!confirmPhone) {
                throw {
                    message: "Phone number confirmation must not be empty."
                }
            };

            if (confirmPhone !== newPhone) {
                throw {
                    status: 400,
                    message: "Phone number confirmation does not match."
                };
            };

            findUser.phone = newPhone;
            await findUser.save();

            const data = await fs.readFileSync('./template_change_phone.html', 'utf-8');
            const tempCompile = await handlebars.compile(data);
            const tempResult = tempCompile({
                phone: newPhone,
                username: findUser.username
            });

            const html = tempResult;

            await transporter.sendMail({
                from: 'asc33nzio.dev@gmail.com',
                to: findUser.email,
                subject: 'SCP Phone Number Change',
                html: html
            });

            res.status(200).send({
                status: 200,
                user: findUser,
                message: "Phone number change successful. Check your e-mail for confirmation."
            });

        } catch (error) {
            console.log(error);
            res.status(400).send({
                status: 400,
                message: error
            });
        };
    },
    changePassword: async (req, res) => {
        try {
            const { oldPassword, newPassword, confirmPassword } = req.body;

            const token = req.headers.authorization.split(' ')[1];

            if (!token) {
                throw {
                    status: 404,
                    message: "Authorization token is missing.",
                };
            };

            const decodeUser = jwt.verify(token, process.env.KEY_JWT);
            const userId = decodeUser.id;

            const findUser = await user.findByPk(userId);

            if (!findUser) {
                throw { message: "Token expired. Please login again before making another request." }
            };

            const isValid = await bcrypt.compare(oldPassword, findUser.password);

            if (!isValid) {
                throw {
                    status: 400,
                    message: "Old password is incorrect."
                };
            };

            if (!confirmPassword) {
                throw {
                    message: "Password confirmation must not be empty."
                }
            };

            if (confirmPassword !== newPassword) {
                throw {
                    status: 400,
                    message: "Password confirmation does not match."
                };
            };

            const salt = await bcrypt.genSalt(5);
            const hashedPassword = await bcrypt.hash(newPassword, salt);

            findUser.password = hashedPassword;
            await findUser.save();

            res.status(200).send({
                status: 200,
                user: findUser,
                message: "Password change successful."
            });

        } catch (error) {
            console.log(error);
            res.status(400).send({
                status: 400,
                message: error
            });
        };
    },
    writeArticle: async (req, res) => {
        try {
            const { title, content, country, categoryId, videoURL, keywords } = req.body;
            const authorId = req.user.id;
            const author = await user.findByPk(authorId);

            if (!title) {
                return res.status(400).send({
                    status: 404,
                    message: "Title cannot be empty."
                });
            };

            if (!authorId) {
                return res.status(400).send({
                    status: 401,
                    message: "You are not authorized to post articles."
                });
            };

            if (!req.file) {
                return res.status(400).send({
                    status: 404,
                    message: "Article image cannot be empty."
                });
            };

            if (req.file.size > 1 * 1024 * 1024) {
                return res.status(400).send({
                    status: 401,
                    message: 'File size must not exceed 1Mb.'
                });
            };

            const category = await categories.findByPk(categoryId);
            if (!category) {
                return res.status(400).send({
                    status: 404,
                    message: "Invalid category ID."
                });
            };

            if (!content) {
                return res.status(400).send({
                    status: 404,
                    message: "Article content cannot be empty."
                });
            };

            const maxLength = 485;
            const excessChars = content.length - maxLength;
            let truncatedContent = content;

            if (excessChars > 0) {
                truncatedContent = content.substring(0, maxLength) + `[+${excessChars}chars..]`;
            };

            if (!keywords) {
                return res.status(400).send({
                    status: 404,
                    message: "You must at least input 1 keyword."
                });
            };

            const findCountry = await countries.findOne({
                where: {
                    country: country
                }
            });

            if (!country) {
                return res.status(400).send({
                    status: 404,
                    message: "Country of origin must not be empty."
                });
            };

            if (!findCountry) {
                return res.status(400).send({
                    status: 404,
                    message: `${country} doesn't exist in the list of valid countries.`
                });
            };

            const keywordArray = keywords.trim().split(',').map(keyword => keyword.trim());
            const uniqueKeywords = [...new Set(keywordArray)];

            const keywordInstances = await Promise.all(uniqueKeywords.map(async (keyword) => {
                const [keywordInstance] = await Keywords.findOrCreate({
                    where: {
                        name: keyword
                    }
                });
                return keywordInstance;
            }));

            const article = await articles.create({
                title,
                author: author.dataValues.username,
                imgURL: req.file.filename,
                category: category.name,
                content: truncatedContent,
                videoURL,
                country,
                likedBy: "",
                categoryId,
                authorId,
            });

            await article.setKeywords_list(keywordInstances);

            function reorderObject(obj, order) {
                return Object.fromEntries(
                    order.map((key) => [key, obj[key]])
                );
            };

            const keywordData = keywordInstances.map(keywordInstance => ({
                id: keywordInstance.id,
                name: keywordInstance.name,
                createdAt: keywordInstance.createdAt
            }));

            article.dataValues.keywords = keywordData;

            const keywordString = keywordData.map(keyword => keyword.name).join(',');

            await articles.update({ keywords: keywordString }, { where: { id: article.id } });

            const desiredOrder = [
                "id",
                "title",
                "author",
                "authorId",
                "category",
                "categoryId",
                "content",
                "country",
                "imgURL",
                "videoURL",
                "createdAt",
                "publish",
                "updatedAt",
                "likeCount",
                "likedBy",
                "users_that_liked",
                "keywords"
            ];

            const articleData = reorderObject(article.dataValues, desiredOrder);

            res.status(200).send({
                status: 201,
                message: "Article created successfully",
                [`${author.dataValues.username}_wrote`]: articleData
            });
        } catch (error) {
            console.log(error);
            res.status(500).send({
                status: 500,
                message: 'Internal server error.'
            });
        }
    },
    userCreatedArticles: async (req, res) => {
        try {
            const token = req.headers.authorization.split(' ')[1];
            const decodeUser = jwt.verify(token, process.env.KEY_JWT);
            const userId = decodeUser.id;

            const findUser = await user.findByPk(userId);

            if (!findUser) {
                return res.status(400).send({
                    status: 404,
                    message: 'Your JWT has expired. Please login again before making another request.'
                });
            };

            const userArticles = await articles.findAll({
                where: { authorId: userId },
                include: [{ model: user, as: 'articleAuthor' }]
            });

            const reorderedResult = userArticles.map(article => {
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
                    id
                } = article.toJSON();

                return {
                    articleId: id,
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

            const totalUserArticles = await articles.count({
                where: { authorId: userId },
                include: [{ model: user, as: 'articleAuthor' }]
            })

            res.status(200).send({
                status: 200,
                totalUserArticles,
                userId: findUser.id,
                username: findUser.username,
                [`articlesBy_${findUser.username}`]: reorderedResult
            });
        } catch (error) {
            console.error(error);
            res.status(500).send({
                status: 500,
                message: 'Internal server error.'
            });
        };
    },
    userLikedArticles: async (req, res) => {
        try {
            const token = req.headers.authorization.split(' ')[1];
            const decodeUser = jwt.verify(token, process.env.KEY_JWT);
            const userId = decodeUser.id;

            const findUser = await user.findByPk(userId);

            if (!findUser) {
                return res.status(400).send({
                    status: 404,
                    message: 'Your JWT has expired. Please login again before making another request.'
                });
            };

            const userLikedArticles = await findUser.getLikedArticles();

            const reorderedResult = userLikedArticles.map(article => {
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
                    id
                } = article.toJSON();

                return {
                    articleId: id,
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

            const totalUserLikedArticles = userLikedArticles.length;

            res.status(200).send({
                status: 200,
                totalUserLikedArticles,
                userId: findUser.id,
                username: findUser.username,
                [`articles_liked_by_${findUser.username}`]: reorderedResult
            });
        } catch (error) {
            console.error(error);
            res.status(500).send({
                status: 500,
                message: 'Internal server error.'
            });
        };
    },
    deleteArticle: async (req, res) => {
        try {
            const articleId = req.params.id;
            const token = req.headers.authorization.split(' ')[1];
            const decodeUser = jwt.verify(token, process.env.KEY_JWT);
            const userId = decodeUser.id;

            if (!userId) {
                return res.status(400).send({
                    status: 401,
                    message: "Unauthorized. You need to provide a valid JWT."
                });
            };

            const article = await articles.findOne({
                where: {
                    id: articleId
                }
            });

            if (!article) {
                return res.status(400).send({
                    status: 404,
                    message: "Article not found."
                });
            };

            const validUser = await user.findByPk(userId);

            if (!validUser) {
                return res.status(400).send({
                    status: 404,
                    message: "User not found."
                });
            };

            if (validUser.isAdmin === true || article.authorId === userId) {
                await article.destroy({
                    where: {
                        id: articleId
                    }
                });
                res.status(200).send({
                    status: 200,
                    message: "Article deleted successfully."
                });
            } else {
                return res.status(400).send({
                    status: 403,
                    WARNING: "EPERM(1): ACCESS DENIED",
                    message: "Forbidden. You are not the author of this article and you are not an administrator."
                });
            };
        } catch (error) {
            res.status(500).send({
                status: 500,
                message: "Internal server error."
            });
        }
    },
    likeArticle: async (req, res) => {
        try {
            const articleId = req.params.id;
            const token = req.headers.authorization.split(' ')[1];
            const decodeUser = jwt.verify(token, process.env.KEY_JWT);
            const userId = decodeUser.id;

            if (!userId) {
                return res.status(400).send({
                    status: 401,
                    message: "Unauthorized. You need to provide a valid JWT."
                });
            };

            const validUser = await user.findByPk(userId);

            if (!validUser) {
                return res.status(400).send({
                    status: 404,
                    message: "User not found."
                });
            };

            const article = await articles.findByPk(articleId);

            if (!article) {
                return res.status(400).send({
                    status: 404,
                    message: "Article not found."
                });
            };

            const existingLike = await likedArticles.findOne({
                where: {
                    userId,
                    articleId,
                }
            });

            if (existingLike) {
                return res.status(400).send({
                    status: 409,
                    message: "You have already liked this article.",
                });
            };

            let usersThatLiked = article.users_that_liked || [];
            if (article.users_that_liked) {
                usersThatLiked = article.users_that_liked;
            };

            if (!usersThatLiked.includes(validUser.username)) {
                usersThatLiked.push(validUser.username);
            };

            await article.update({
                users_that_liked: usersThatLiked
            });

            await likedArticles.create({
                userId,
                articleId,
            });

            await articles.increment('likeCount', {
                where: {
                    id: articleId
                }
            });

            res.status(200).send({
                status: 201,
                userId: userId,
                username: validUser.username,
                articleId: articleId,
                title: article.title,
                message: "Article liked!"
            });
        } catch (error) {
            res.status(500).send({
                status: 500,
                message: "Internal server error."
            });
        }
    },
    unlikeArticle: async (req, res) => {
        try {
            const articleId = req.params.id;
            const token = req.headers.authorization.split(' ')[1];
            const decodeUser = jwt.verify(token, process.env.KEY_JWT);
            const userId = decodeUser.id;

            if (!userId) {
                return res.status(401).send({
                    status: 401,
                    message: "Unauthorized. You need to provide a valid JWT.",
                });
            }

            const validUser = await user.findByPk(userId);

            if (!validUser) {
                return res.status(404).send({
                    status: 404,
                    message: "User not found.",
                });
            }

            const article = await articles.findByPk(articleId);

            if (!article) {
                return res.status(404).send({
                    status: 404,
                    message: "Article not found.",
                });
            }

            const existingLike = await likedArticles.findOne({
                where: {
                    userId,
                    articleId,
                },
            });

            if (!existingLike) {
                return res.status(400).send({
                    status: 400,
                    message: "You have not liked this article yet.",
                });
            }

            let usersThatLiked = article.users_that_liked || [];

            if (usersThatLiked.includes(validUser.username)) {
                usersThatLiked = usersThatLiked.filter(
                    (username) => username !== validUser.username
                );
            }

            await article.update({
                users_that_liked: usersThatLiked,
            });

            await likedArticles.destroy({
                where: {
                    userId,
                    articleId,
                },
            });

            await articles.decrement('likeCount', {
                where: {
                    id: articleId,
                },
            });

            res.status(200).send({
                status: 200,
                userId: userId,
                username: validUser.username,
                articleId: articleId,
                title: article.title,
                message: "Article unliked!",
            });
        } catch (error) {
            res.status(500).send({
                status: 500,
                message: "Internal server error.",
            });
        }
    },
    createNewCategory: async (req, res) => {
        try {
            const newCategory = req.body.category;

            const findCategory = await categories.findOne({
                where: {
                    name: newCategory
                }
            });

            if (!newCategory) {
                return res.status(400).send({
                    status: 404,
                    message: "New category cannot be empty."
                });
            };

            if (findCategory) {
                return res.status(400).send({
                    status: 400,
                    message: `Category: ${newCategory} already exists, please choose another category to add.`
                });
            };

            await categories.create({
                name: newCategory
            });

            res.status(200).send({
                status: 201,
                message: `New category: ${newCategory} successfully created.`

            });
        } catch (error) {
            res.status(500).send({
                status: 500,
                message: error
            });
        }
    }
};
