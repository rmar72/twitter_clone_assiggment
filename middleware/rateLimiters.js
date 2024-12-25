const rateLimit = require('express-rate-limit');

const tweetLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again after 15 minutes'
});

const trendingHashtagsLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 200, // limit each IP to 200 requests per windowMs
  message: 'Too many requests from this IP, please try again after a minute'
});

module.exports = {
  tweetLimiter,
  trendingHashtagsLimiter
};
