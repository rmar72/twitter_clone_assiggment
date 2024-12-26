
import http from 'k6/http';
import { check, sleep } from 'k6';

const BASE_URL = 'http://localhost:8080';

export const options = {
    stages: [
        { duration: '30s', target: 50 },  // 50 users, 30 seconds
        { duration: '1m', target: 50 },  // 50 users, 1 minute
        { duration: '30s', target: 0 },  // down to 0 users, 30 seconds
    ],
};

const tweets = [
    'This is #tweet1',
    'Another tweet with #tweet2',
    'Duplicate tweet #tweet1',
    'New tweet with #tweet3',
    'Another one #tweet4',
    'Duplicate tweet #tweet1',
    'This is #tweet1',
    'New tweet with1 #tweet3',
    'New tweet with3 #tweet3',
];

export default function () {
    // Randomly pick a tweet
    const tweet = tweets[Math.floor(Math.random() * tweets.length)];

    // POST /tweet
    const resPost = http.post(`${BASE_URL}/tweet`, JSON.stringify({ tweet }), {
        headers: { 'Content-Type': 'application/json' },
    });
    check(resPost, {
        'POST /tweet status is 202 or 200': (r) => r.status === 202 || r.status === 200,
    });

    // Simulate a sleep wait
    sleep(1);

    // GET /trending-hashtags
    const resGet = http.get(`${BASE_URL}/trending-hashtags`);
    check(resGet, {
        'GET /trending-hashtags status is 200': (r) => r.status === 200,
        'GET /trending-hashtags returns hashtags': (r) => JSON.parse(r.body).hashtags.length > 0,
    });
}
