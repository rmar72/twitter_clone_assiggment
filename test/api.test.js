// const request = require('supertest');
// const app = require('../twitter_trending_service'); // Path to your server app

// describe('API Integration Tests', () => {
//     test('POST /tweet should queue a new tweet', async () => {
//         const response = await request(app)
//             .post('/tweet')
//             .send({ tweet: 'Test tweet with #test' });

//         expect(response.status).toBe(202);
//         expect(response.body.message).toBe('Tweet queued for processing.');
//     });

//     test('POST /tweet should skip duplicate tweet', async () => {
//         await request(app)
//             .post('/tweet')
//             .send({ tweet: 'Duplicate tweet with #duplicate' });

//         const response = await request(app)
//             .post('/tweet')
//             .send({ tweet: 'Duplicate tweet with #duplicate' });

//         expect(response.status).toBe(200);
//         expect(response.body.message).toBe('Duplicate tweet, skipped processing.');
//     });

//     test('GET /trending-hashtags should return trending hashtags', async () => {
//         const response = await request(app).get('/trending-hashtags');

//         expect(response.status).toBe(200);
//         expect(Array.isArray(response.body.hashtags)).toBe(true);
//     });
// });


import request from 'supertest';
import app from '../twitter_trending_service'; // Path to your app

describe('API Integration Tests', () => {
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
        await request(app)
            .post('/tweet')
            .send({ tweet });

        // Second request (duplicate)
        const response = await request(app)
            .post('/tweet')
            .send({ tweet });

        expect(response.status).toBe(200);
        expect(response.body.message).toBe('Duplicate tweet, skipped processing.');
    });

    it('should return trending hashtags', async () => {
        const response = await request(app).get('/trending-hashtags');

        expect(response.status).toBe(200);
        expect(Array.isArray(response.body.hashtags)).toBe(true);
    });
});
