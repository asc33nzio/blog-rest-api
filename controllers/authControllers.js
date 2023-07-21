const db = require('../models');
const { Op } = require('sequelize');
const user = db.User;
const changeEmailRequest = db.ChangeEmailRequest;
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const transporter = require('../middleware/transporter');
const fs = require('fs');
const handlebars = require('handlebars');

module.exports = {
    register: async (req, res) => {
        try {
            const { username, email, phone, password, confirm_password } = req.body;

            const isUserExist = await user.findOne({
                where: { username }
            });

            const isEmailExist = await user.findOne({
                where: { email }
            });

            const isPhoneExist = await user.findOne({
                where: { phone }
            });

            if (isUserExist) {
                throw {
                    message: "Username has been used."
                }
            };

            if (isEmailExist) {
                throw {
                    message: "Email has been used."
                }
            };

            if (isPhoneExist) {
                throw {
                    message: "Phone number has been used."
                }
            };

            if (!confirm_password) {
                throw {
                    message: "Password confirmation must not be empty."
                }
            };

            const salt = await bcrypt.genSalt(5);
            const hashPassword = await bcrypt.hash(password, salt);

            const result = await user.create({ username: username, email: email, phone: phone, password: hashPassword });

            const data = await fs.readFileSync('./template_verify.html', 'utf-8');
            const tempCompile = await handlebars.compile(data);
            const tempResult = tempCompile({ username: username });

            const payload = {
                id: result.id
            };

            const token = jwt.sign(payload, process.env.KEY_JWT, { expiresIn: '1h' });
            const htmlWithToken = tempResult.replace('TOKEN_PLACEHOLDER', token);

            await transporter.sendMail({
                from: 'asc33nzio.dev@gmail.com',
                to: email,
                subject: 'SCP Verify E-mail Address',
                html: htmlWithToken
            });

            res.status(200).send({
                status: 201,
                message: "User registstration successful.",
                new_user_info: result,
                JWT: token
            });
        } catch (error) {
            console.log(error);
            res.status(400).send({
                status: 400,
                message: error
            })
        }
    },
    login: async (req, res) => {
        try {
            const { username, email, phone, password } = req.body;

            const checkLogin = await user.findOne({
                where: {
                    [Op.or]: [
                        { username: username || null },
                        { email: email || null },
                        { phone: phone || null }
                    ]
                }
            });

            if (!checkLogin) {
                throw {
                    status: 404,
                    message: "User not found."
                };
            };

            const isValid = await bcrypt.compare(password, checkLogin.password);

            if (!isValid) {
                throw {
                    status: 400,
                    message: "Wrong password."
                };
            };

            const payload = {
                id: checkLogin.id,
                isAdmin: checkLogin.isAdmin,
                isVerified: checkLogin.isVerified
            };

            if (payload.isVerified === false) {
                throw {
                    status: 400,
                    message: "Please verify your account first."
                };
            };

            const token = jwt.sign(payload, process.env.KEY_JWT, { expiresIn: '1h' });

            // Simple javascript validation without hashing process
            // if (checkLogin.password !== password) {
            //     throw { message: "Wrong password." }
            // }

            res.status(200).send({
                status: 200,
                message: "Login successful.",
                user_info: checkLogin,
                JWT: token
            })
        } catch (error) {
            res.status(400).send({
                status: 400,
                message: error
            });
        }
    },
    verifyAccount: async (req, res) => {
        try {
            const { token } = req.params;

            const payload = jwt.verify(token, process.env.KEY_JWT);
            const userId = payload.id;
            const findUser = await user.findByPk(userId);

            const changingEmail = await changeEmailRequest.findOne({
                where: { userId }
            });

            if (!findUser) {
                return res.status(400).send({
                    status: 404,
                    message: "User not found."
                });
            };

            if (findUser.isVerified === true) {
                throw { message: "Your account is already verified." }
            };

            if (changingEmail) {
                return res.status(400).send({
                    status: 401,
                    message: "Your account is currently undergoing an e-mail change. Please verify the new email address instead."
                });
            };

            findUser.isVerified = true;
            await findUser.save();

            res.status(200).send({
                status: 201,
                message: "Verification successful.",
                user_info: findUser
            });
        } catch (error) {
            console.log(error);
            res.status(500).send({
                status: 500,
                message: error
            });
        }
    },
    verifyNewEmail: async (req, res) => {
        try {
            const { token } = req.params;

            const reVerifyEmail = await changeEmailRequest.findOne({
                where: { token }
            });

            if (!reVerifyEmail) {
                return res.status(400).send({
                    status: 400,
                    message: 'Invalid or expired verification token.'
                });
            };

            const userId = reVerifyEmail.userId;
            const findUser = await user.findByPk(userId);

            if (!findUser) {
                return res.status(400).send({
                    status: 400,
                    message: 'User not found.'
                });
            };

            findUser.email = reVerifyEmail.newEmail;
            findUser.isVerified = true;
            await findUser.save();

            await changeEmailRequest.destroy({
                where: { id: reVerifyEmail.id }
            });

            res.status(200).send({
                status: 200,
                message: 'Email verification successful. Your email has been updated.'
            });
        } catch (error) {
            console.error(error);
            res.status(500).send({
                status: 500,
                message: 'Internal server error.'
            });
        }
    },
    resetPasswordRequest: async (req, res) => {
        try {
            const { email } = req.body;

            const findUser = await user.findOne({
                where: {
                    email: email
                }
            });

            if (!findUser) {
                return res.status(404).send({
                    status: 404,
                    message: "Account not found."
                })
            };

            const data = await fs.readFileSync('./template_reset.html', 'utf-8');
            const tempCompile = await handlebars.compile(data);
            const tempResult = tempCompile({ username: findUser.username });

            const payload = {
                id: findUser.id
            }

            const token = jwt.sign(payload, process.env.KEY_JWT, { expiresIn: '1h' });
            const htmlWithToken = tempResult.replace('TOKEN_PLACEHOLDER', token);

            await transporter.sendMail({
                from: 'asc33nzio.dev@gmail.com',
                to: email,
                subject: 'SCP Reset Account Password',
                html: htmlWithToken
            });

            res.status(200).send({
                status: 200,
                message: "Please check your e-mail for the password reset link.",
                JWT: token
            });
        } catch (error) {
            console.log(error);
            res.status(500).send({
                status: 500,
                message: "Internal server error."
            });
        }
    },
    resetPassword: async (req, res) => {
        try {
            const { token } = req.params;
            const { newPassword } = req.body;

            const payload = jwt.verify(token, process.env.KEY_JWT);

            const userId = payload.id;

            const findUser = await user.findByPk(userId);

            if (!findUser) {
                throw { message: "Link expired. Please resend another password reset request." }
            };

            const salt = await bcrypt.genSalt(5);
            const hashedPassword = await bcrypt.hash(newPassword, salt);

            findUser.password = hashedPassword;
            await findUser.save();

            res.status(200).send({
                status: 200,
                user: findUser,
                message: "Password reset successful."
            })

        } catch (error) {
            console.log(error);
            res.status(500).send({
                status: 500,
                message: "Internal server error."
            })
        }
    }
};