const { generateHash, extractHashtags } = require('../utils'); 

describe('Unit Tests', () => {
    it('should extract hashtags correctly', () => {
        const tweet = 'This is a tweet with #hashtag1 and #hashtag2';
        const hashtags = extractHashtags(tweet);

        expect(hashtags).toEqual(['#hashtag1', '#hashtag2']);
    });

    it('should generate consistent hash', () => {
        const hash1 = generateHash('Hello world!');
        const hash2 = generateHash('Hello world!');

        expect(hash1).toBe(hash2); // Same input = produce same hash
    });

    it('should generate different hashes for different inputs', () => {
        const hash1 = generateHash('Hello world!');
        const hash2 = generateHash('Hello there!');

        expect(hash1).not.toBe(hash2); // different input = produce different hashes
    });
});
