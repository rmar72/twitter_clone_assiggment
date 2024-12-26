const crypto = require('crypto');

function generateHash(tweet) {
    return crypto.createHash('sha256').update(tweet).digest('hex');
}

function extractHashtags(tweet) {
  const hashtagRegex = /#\w+/g;
  return tweet.match(hashtagRegex) || [];
}

module.exports = { generateHash, extractHashtags };
