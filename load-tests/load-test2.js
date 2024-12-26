// High load
import http from 'k6/http';
import { check, sleep } from 'k6';

const BASE_URL = 'http://localhost:8080';

export const options = {
    stages: [
        { duration: '30s', target: 100 },  // 100 users, 30 seconds
        { duration: '1m', target: 500 },   // 500 users, 1 minute
        { duration: '2m', target: 1000 },  // 1000 users,  2 minutes
        { duration: '2m', target: 1000 },  // 1000 users, 2 minutes
        { duration: '1m', target: 0 },     // 0 users, 1 minute
    ],
    thresholds: {
        http_req_duration: ['p(95)<500'],  // 95% of requests should complete in < 500ms
        http_req_failed: ['rate<0.01'],    // Error rate should be < 1% pretty stringent demand
    },
};

const tweets = [
    'High load test tweet #load1',
    'Another high load test tweet #load2',
    'Yet another test #load3',
    'More testing under load #load4',
    'Last test #load5',
];

export default function () {
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
