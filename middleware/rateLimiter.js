const moment = require('moment');
const userLastSubmission = {};

module.exports = {
    rateLimiter: (req, res, next) => {
        const authorId = req.user.id;
        const currentTime = moment();

        if (userLastSubmission[authorId]) {
            const lastSubmissionTime = userLastSubmission[authorId];
            const timeDifferenceInSeconds = currentTime.diff(lastSubmissionTime, 'seconds');

            if (timeDifferenceInSeconds < 15) {
                return res.status(429).send({
                    status: 429,
                    message: 'You can only post one article every 15 seconds.'
                });
            };
        };

        userLastSubmission[authorId] = currentTime;
        console.log(userLastSubmission);

        next();
    }
};