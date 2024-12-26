// better variation of load-test2
import http from 'k6/http';
import { check, sleep } from 'k6';

const BASE_URL = 'http://localhost:8080';

export const options = {
    stages: [
        { duration: '30s', target: 100 },  // 100 users, 30 seconds
        { duration: '1m', target: 500 },   // 500 users, 1 minute
        { duration: '2m', target: 1000 },  // 1000 users, 2 minutes
        { duration: '2m', target: 1000 },  // 1000 users, 2 minutes
        { duration: '1m', target: 0 },     // 0 users, 1 minute
    ],
    thresholds: {
        http_req_duration: ['p(95)<300'],  // 95% of requests should complete within 300ms
        http_req_failed: ['rate<0.01'],    // Error rate should be less than 1% still pretty stringent demand
    },
};

const tweets = [
    'Testing #hashtag1 under high load #k6',
    'Simulating traffic with #loadtest tools #k6',
    'Another load test tweet #loadTest',
    'Tweet about #Redis and #NodeJS',
    'High-performance apps are fun! #Dev',
    'Redis queues make life easier #backend',
    'Real-time hashtag tracker #coolstuff',
    'K6 is an amazing load test tool #testing',
    'Stress testing with #k6 and #redis',
    'Hashtag wars #loadtest',
    'Scaling Node.js apps with #Redis',
    'Handling thousands of requests #devops',
];

export default function () {
    // randomly pick GET(40%) or post(60%)
    const action = Math.random() < 0.6 ? 'POST' : 'GET';

    if (action === 'POST') {
        const tweet = tweets[Math.floor(Math.random() * tweets.length)];
        const res = http.post(`${BASE_URL}/tweet`, JSON.stringify({ tweet }), {
            headers: { 'Content-Type': 'application/json' },
        });

        check(res, {
            'POST /tweet status is 202 or 200': (r) => r.status === 202 || r.status === 200,
            'POST /tweet response time is < 300ms': (r) => r.timings.duration < 300,
        });
    } else {
      const res = http.get(`${BASE_URL}/trending-hashtags`);
  
      if (res.status !== 200) {
          console.error(`GET /trending-hashtags failed. Status: ${res.status}, Body: ${res.body}`);
      }
  
      check(res, {
          'GET /trending-hashtags status is 200': (r) => r.status === 200,
          'GET /trending-hashtags returns hashtags': (r) => {
              if (!r.body) {
                console.error('Empty response from /trending-hashtags');
                return false;
              }
              try {
                  const body = JSON.parse(r.body);
                  return body.hashtags && body.hashtags.length > 0;
              } catch (err) {
                  console.error(`Failed to parse JSON. Body: ${r.body}`);
                  return false;
              }
          },
          'GET /trending-hashtags response time is < 300ms': (r) => r.timings.duration < 300,
      });
    }
  
    // keep simulating sleep waits betwwen requests
    sleep(Math.random() * 2); // rando m sleep time between 0 and 2 seconds
}
