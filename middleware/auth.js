const jwt = require('jsonwebtoken');

module.exports = {
    verifyToken: (req, res, next) => {
        try {
            let token = req.headers.authorization;

            if (!token) {
                throw {
                    status: 401,
                    message: "Access denied--Unauthorized Request // Token missing."
                };
            };
            token = token.split(' ')[1];

            let verifiedUser;
            try {
                verifiedUser = jwt.verify(token, process.env.KEY_JWT);
            } catch (error) {
                throw {
                    status: 401,
                    message: "Access denied--Unauthorized Request // Invalid malformed token // Token expired."
                };
            };

            req.user = verifiedUser;
            next();

        } catch (error) {
            console.log(error);
            res.status(400).send({
                status: 400,
                message: error
            });
        }
    },
    checkRole: (req, res, next) => {
        if (req.user.isAdmin) {
            return next();
        };

        res.status(400).send({
            status: 403,
            message: "Forbidden! You are not an administrator."
        });
    }
}