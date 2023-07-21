const { body, validationResult, check } = require('express-validator');

module.exports = {
    checkRegister: async (req, res, next) => {
        try {
            await body('username').notEmpty().withMessage('Username must be filled.').isAlphanumeric().withMessage('Username must only contain alphanumeric characters.').run(req);

            await body('email').notEmpty().withMessage('E-mail must be filled.').isEmail().withMessage('Incorrect e-mail format.').run(req);

            await body('phone')
                .notEmpty().withMessage('Phone number must be filled')
                .custom((value) => {
                    const phoneRegex = /^0\d{9,11}$/;
                    if (!phoneRegex.test(value)) {
                        throw new Error('Phone numbers should start with 0, with a minimum of 10 digits and a maximum of 12 digits.');
                    }
                    return true;
                })
                .run(req);

            await body('password')
                .notEmpty().withMessage('Password must be filled.')
                .isStrongPassword({
                    minLength: 6,
                    minLowercase: 1,
                    minUppercase: 1,
                    minNumbers: 1,
                    minSymbols: 1
                }).withMessage("Password should be at least 6 characters, with a minimum of 1 lower and uppercase letters, includes 1 number and 1 symbol.")
                .run(req);

            await body('confirm_password').notEmpty().equals(req.body.password).withMessage('Password confirmation does not match').run(req);

            const validation = validationResult(req);

            if (validation.isEmpty()) {
                next();
            } else {
                return res.status(400).send({
                    status: 400,
                    message: "Validation unsuccessful.",
                    error: validation.array()
                })
            }
        } catch (error) {
            console.log(error);
            res.status(500).send({
                status: 500,
                message: 'Something went wrong during the registration process.'
            });
        }
    },
    checkVerification: async (req, res, next) => {
        try {
            const user = req.user;

            if (user.isVerified === true) {
                next();
            } else {
                return res.status(401).send({
                    status: 401,
                    message: "You are not authorized. Please verify your account first."
                })
            }
        } catch (error) {
            return res.status(400).send({
                status: 400,
                message: "Something went wrong during the user verification status check."
            })
        }
    },
    checkUsername: async (req, res, next) => {
        try {
            await body('newUsername').notEmpty().withMessage('Username must be filled.').isAlphanumeric().withMessage('Username must only contain alphanumeric characters.').run(req);

            await body('confirmUsername').notEmpty().equals(req.body.newUsername).withMessage('Username confirmation does not match').run(req);

            const validation = validationResult(req);

            if (validation.isEmpty()) {
                next();
            } else {
                return res.status(400).send({
                    status: 400,
                    message: "Validation unsuccessful.",
                    error: validation.array()
                })
            }
        } catch (error) {
            console.log(error);
            res.status(500).send({
                status: 500,
                message: 'Something went wrong during the checking process.'
            });
        }
    },
    checkPasswordReset: async (req, res, next) => {
        try {
            await body('newPassword')
                .notEmpty().withMessage('New password must be filled.')
                .isStrongPassword({
                    minLength: 6,
                    minLowercase: 1,
                    minUppercase: 1,
                    minNumbers: 1,
                    minSymbols: 1
                }).withMessage("Password should be at least 6 characters, with a minimum of 1 lower and uppercase letters, includes 1 number and 1 symbol.")
                .run(req);

            await body('confirmPassword').notEmpty().equals(req.body.newPassword).withMessage('Password does not match').run(req);

            const validation = validationResult(req);

            if (validation.isEmpty()) {
                next();
            } else {
                return res.status(400).send({
                    status: 400,
                    message: "Validation unsuccessful.",
                    error: validation.array()
                });
            };
        } catch (error) {
            console.log(error);
            res.status(500).send({
                status: 500,
                message: 'Something went wrong during the checking process.'
            });
        };
    },
    checkPasswordChange: async (req, res, next) => {
        try {
            await body('newPassword')
                .notEmpty().withMessage('New password must be filled.')
                .isStrongPassword({
                    minLength: 6,
                    minLowercase: 1,
                    minUppercase: 1,
                    minNumbers: 1,
                    minSymbols: 1
                }).withMessage("Password should be at least 6 characters, with a minimum of 1 lower and uppercase letters, includes 1 number and 1 symbol.")
                .run(req);

            await body('confirmPassword').notEmpty().equals(req.body.newPassword).withMessage('Password does not match').run(req);

            const validation = validationResult(req);

            if (validation.isEmpty()) {
                next();
            } else {
                return res.status(400).send({
                    status: 400,
                    message: "Validation unsuccessful.",
                    error: validation.array()
                });
            };
        } catch (error) {
            console.log(error);
            res.status(500).send({
                status: 500,
                message: 'Something went wrong during the checking process.'
            });
        };
    },
    checkPasswordLogin: async (req, res, next) => {
        try {
            await body('password')
                .notEmpty().withMessage('Password must be filled.')
                .isStrongPassword({
                    minLength: 6,
                    minLowercase: 1,
                    minUppercase: 1,
                    minNumbers: 1,
                    minSymbols: 1
                }).withMessage("Password should be at least 6 characters, with a minimum of 1 lower and uppercase letters, includes 1 number and 1 symbol.")
                .run(req);

            const validation = validationResult(req);

            if (validation.isEmpty()) {
                next();
            } else {
                return res.status(400).send({
                    status: 400,
                    message: "Validation unsuccessful.",
                    error: validation.array()
                });
            };
        } catch (error) {
            console.log(error);
            res.status(500).send({
                status: 500,
                message: 'Something went wrong during the checking process.'
            });
        };
    },
    checkEmail: async (req, res, next) => {
        try {
            await body('newEmail').notEmpty().withMessage('E-mail must be filled.').isEmail().withMessage('Incorrect e-mail format.').run(req);

            await body('confirmEmail').notEmpty().equals(req.body.newEmail).withMessage('E-mail confirmation does not match').run(req);

            const validation = validationResult(req);

            if (validation.isEmpty()) {
                next();
            } else {
                return res.status(400).send({
                    status: 400,
                    message: "Validation unsuccessful.",
                    error: validation.array()
                })
            }
        } catch (error) {
            console.log(error);
            res.status(500).send({
                status: 500,
                message: 'Something went wrong during the checking process.'
            });
        }
    },
    checkPhone: async (req, res, next) => {
        try {
            await body('newPhone')
                .notEmpty().withMessage('Phone number must be filled')
                .custom((value) => {
                    const phoneRegex = /^0\d{9,11}$/;
                    if (!phoneRegex.test(value)) {
                        throw new Error('Phone numbers should start with 0, with a minimum of 10 digits and a maximum of 12 digits.');
                    }
                    return true;
                })
                .run(req);

            await body('confirmPhone').notEmpty().equals(req.body.newPhone).withMessage('Phone number confirmation does not match').run(req);

            const validation = validationResult(req);

            if (validation.isEmpty()) {
                next();
            } else {
                return res.status(400).send({
                    status: 400,
                    message: "Validation unsuccessful.",
                    error: validation.array()
                })
            }
        } catch (error) {
            console.log(error);
            res.status(500).send({
                status: 500,
                message: 'Something went wrong during the checking process.'
            });
        }
    },
    checkLoginAll: async (req, res, next) => {
        try {
            await check('username')
                .notEmpty().withMessage('Username must be filled.')
                .isAlphanumeric().withMessage('Username must only contain alphanumeric characters.')
                .optional({ nullable: true })
                .run(req);

            await check('email')
                .notEmpty().withMessage('E-mail must be filled.')
                .isEmail().withMessage('Incorrect e-mail format.')
                .optional({ nullable: true })
                .run(req);

            await check('phone')
                .notEmpty().withMessage('Phone number must be filled')
                .custom((value) => {
                    const phoneRegex = /^0\d{9,11}$/;
                    if (!phoneRegex.test(value)) {
                        throw new Error('Phone numbers should start with 0, with a minimum of 10 digits and a maximum of 12 digits.');
                    }
                    return true;
                })
                .optional({ nullable: true })
                .run(req);

            const validationErrors = validationResult(req);

            if (validationErrors.isEmpty()) {
                next();
            } else {
                return res.status(400).send({
                    status: 400,
                    message: "Validation unsuccessful.",
                    error: validationErrors.array()
                })
            };
        } catch (error) {
            console.log(error);
            res.status(500).send({
                status: 500,
                message: 'Something went wrong during the checking process.'
            });
        }
    }
};