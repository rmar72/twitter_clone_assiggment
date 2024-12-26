const { createApp } = require('../twitter_trending_service');
const Redis = require('ioredis-mock');
const request = require('supertest');

describe('API Integration Tests', () => {
    let app;
    let redisClient;

    beforeAll(() => {
        redisClient = new Redis(); // Mock Redis client
        app = createApp(redisClient);
    });

    afterAll(async () => {
        await redisClient.quit(); // Clean up Redis mock
    });

    it('should queue a new tweet', async () => {
        const response = await request(app)
            .post('/tweet')
            .send({ tweet: 'This is #TestTweet' });

        expect(response.status).toBe(202);
        expect(response.body.message).toBe('Tweet queued for processing.');
    });

    it('should skip a duplicate tweet', async () => {
        const tweet = 'This is #DuplicateTest';

        // First request
        await request(app).post('/tweet').send({ tweet });

        // Second request (duplicate)
        const response = await request(app).post('/tweet').send({ tweet });

        expect(response.status).toBe(200);
        expect(response.body.message).toBe('Duplicate tweet, skipped processing.');
    });

    it('should return trending hashtags', async () => {
        const response = await request(app).get('/trending-hashtags');

        expect(response.status).toBe(200);
        expect(Array.isArray(response.body.hashtags)).toBe(true);
    });
});
