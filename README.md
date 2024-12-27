# **Redis-Centric Real-Time Processing Application**

This application is a real-time processing system designed to manage, process, and analyze tweets to determine trending hashtags. By leveraging Redis for its speed and efficiency, the app ensures scalability and responsiveness in high-traffic scenarios. It is composed of two key services: an API service for handling tweet submissions and trending hashtag retrieval, and a worker service that processes queued tweets to extract and update hashtag trends.

## **Architecture Overview:**
**API Service (twitter_trending_service.js):**
- Keeps track of tweets to avoid processing duplicates using Redis.
- Uses rate limiters to keep the API running smoothly without overloads.

**Worker Service (worker.js):**
- Works through tweets from the Redis queue nonstop.
- Pulls out hashtags from tweets and updates their scores in the ranking system.
- Makes sure trending hashtags are updated in real-time.

**Redis:**
- Manages tweet queues, checks for duplicates, and ranks hashtags.
- Set up to save data so nothing gets lost when restarting.

----------------------------------------------------------------------------------------------------------------------------------------------------------

_**Setup and Running Instructions**
Prerequisites:
Docker
Node.js (if running outside Docker)_

### **Steps to Run the Application**

**1. Clone the Repository:**

- git clone https://github.com/rmar72/twitter_clone_assignment.git

- cd twitter_clone_assignment

**2. Build and Start the application:**
- docker-compose up --build

**3. Access the Services:**
- API: http://localhost:8080
- Redis: Bound to localhost:6379
  
_Note:_ Both the API and Redis services run inside Docker containers. Redis can be accessed using any Redis client or library by connecting to localhost on port 6379. Ensure Docker is running and the containers are started.

----------------------------------------------------------------------------------------------------------------------------------------------------------

**API Usage:**

**To submit a tweet:**
curl -X POST http://localhost:8080/tweet -H "Content-Type: application/json" -d '{"tweet": "Check out this amazing app! #Redis #NodeJS"}'

**To get trending hashtags:**
curl -i -X GET "http://localhost:8080/trending-hashtags"

----------------------------------------------------------------------------------------------------------------------------------------------------------
**Testing**

_**Unit and Integration Testing**_

The application includes unit and integration tests using Jest and Supertest. These tests ensure the API is working as expected.

_Note:_ The integration test currently requires work.

----------------------------------------------------------------------------------------------------------------------------------------------------------
**Load Testing**

The application also includes 3 load tests that progressively increase the load to challenge the application’s performance and identify its capacity limits. The load tests simulate real-world scenarios with users and a mixture of GET and POST requests, my goal was to push the app to handle higher traffic and stress conditions.

So far my fiindings are:

**Load Test 1:**
- **Scenario**: 50 virtual users making API requests for 2 minutes and 30 seconds, ramping up and down gracefully over 30 seconds each.
- **Notable Metrics: Thorughput:**: Approx. 3,984 iterations completed, achieving ~33 requests per second.

**Load Test 2:**
- **Scenario**: 1,000 virtual users over 6 minutes and 30 seconds, including a 5-stage ramp-up to test scalability under heavy traffic.
- **Notable Metrics: Thorughput:**: Approx. 88,137 iterations completed, achieving ~226 requests per second.
- **Error Threshold:**: Application struggled to meet expected response times under peak load. (I believe this issue can be overcome by deploying the app in a cloud environment with Docker Swarm or Kubernetes, enabling horizontal scaling and proper resource allocation.)


_Note:_ load-test3.js requires additional work to address some inconsistencies and better reflect realistic stress scenarios.

---------------------------------------------------------------------------------------------------------------------------------------------------------
**Process Management**

I also have further explored using PM2 for production purposes to handle process management, clustering, and monitoring to enhance stability and performance.

----------------------------------------------------------------------------------------------------------------------------------------------------------
### **Local Development Without Docker**

_Note:_ Running the application locally with Node.js is intended primarily for profiling purposes, such as using Clinic.js or Node.js built-in profiling tools. For standard development or production usage, the Docker + Datadog setup is recommended.

- **Install Dependencies:**
npm install

- **Start the API:**
npm run start

- **Perform Clinic check on API:**
npm run clinic 


----------------------------------------------------------------------------------------------------------------------------------------------------------

**Environment Variables**
- REDIS_HOST: redis (for local change it to: localhost).
- REDIS_PORT: 6379
- PORT: 8080

----------------------------------------------------------------------------------------------------------------------------------------------------------
### **Optional:** 
- **Datadog Integration**
The application is integrated with Datadog for monitoring, including metrics and APM for both the application and the Redis database. Datadog APM provides detailed performance insights, while Redis metrics track database performance and usage.

A Datadog API key is required to set up the Datadog Agent. This key ensures the agent can report metrics and traces to your Datadog account.
The setup involves starting a new container for the Datadog Agent (as outlined in the Datadog documentation), not adding another service to the existing docker-compose.yml.
A folder with screenshots of the current Datadog dashboard is available for reference.

