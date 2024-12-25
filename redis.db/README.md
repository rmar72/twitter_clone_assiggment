Redis-Centric Real-Time Processing Application

This application is a real-time processing system designed to manage, process, and analyze tweets to determine trending hashtags. By leveraging Redis for its speed and efficiency, the app ensures scalability and responsiveness in high-traffic scenarios. It is composed of two key services: an API service for handling tweet submissions and trending hashtag retrieval, and a worker service that processes queued tweets to extract and update hashtag trends.

Architecture Overview:
API Service (twitter_trending_service.js):
- Keeps track of tweets to avoid processing duplicates using Redis.
- Uses rate limiters to keep the API running smoothly without overloads.

Worker Service (worker.js):
- Works through tweets from the Redis queue nonstop.
- Pulls out hashtags from tweets and updates their scores in the ranking system.
- Makes sure trending hashtags are updated in real-time.

Redis:
- Manages tweet queues, checks for duplicates, and ranks hashtags.
- Set up to save data so nothing gets lost when restarting.


Setup and Running Instructions
Prerequisites:
Docker
Node.js (if running outside Docker)

Steps to Run the Application

Clone the Repository:
git clone <repository-url>
cd <repository-folder>

Build and Start the Application Using Docker Compose:
docker-compose up --build

Access the Services:
API: http://localhost:8080
Redis: Bound to localhost:6380

Testing the API:

To submit a tweet:
curl -X POST http://localhost:8080/tweet -H "Content-Type: application/json" -d '{"tweet": "Check out this amazing app! #Redis #NodeJS"}'

To get trending hashtags:
curl http://localhost:8080/trending-hashtags
Local Development Without Docker

Install Dependencies:
npm install

Start the API:
node twitter_trending_service.js
Start the Worker:

Start the worker:
node worker.js


Environment Variables
REDIS_HOST: Redis server hostname (default: localhost).
REDIS_PORT: Redis server port (default: 6379).

Optional: Datadog Integration
The application supports Datadog APM for monitoring. Uncomment and configure the datadog service in docker-compose.yml and ensure the Datadog Agent is properly set up with your API key.

Monitoring and Performance
The application logs key performance metrics and handles errors gracefully. All logs and metrics are containerized for easy debugging.