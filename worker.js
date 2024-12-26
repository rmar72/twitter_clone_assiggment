// This line must come before importing any instrumented module.
// const tracer = require('dd-trace').init()
const tracer = require('dd-trace').init({
    service: 'twitter_trending_service_worker',
    env: 'production',
    hostname: 'localhost',  // Communicates with the Agent via the local APM port
    port: 8126,
    logInjection: true,
  });

const { createClient } = require('redis');
const { performance, PerformanceObserver } = require('perf_hooks');
const { TWEET_QUEUE_KEY, HASHTAGS_SORTED_KEY } = require('./constants');
const { extractHashtags } = require('./utils'); 

// redis config
const redisClient = createClient({
    url: `redis://${process.env.REDIS_HOST || 'localhost'}:${process.env.REDIS_PORT || 6379}`,
});
redisClient.connect().catch(console.error);

let emptyQueueCount = 0;


// Worker logic is to process tweets from the queue
async function processQueue() {
    while (true) {
        performance.mark('start-process-tweet');
        try {
            // Fetch the next tweet from the queue (blocking for up to 10 seconds)
            const result = await redisClient.blPop(TWEET_QUEUE_KEY, 10); // 10 seconds timeout
            if (!result) {
            emptyQueueCount++;
            if (emptyQueueCount % 10 === 0) { // this is to reduce bloated logs so thiis logs only every 10 timeouts
                console.log('No tweet found in queue within timeout. Waiting...');
            }
            continue;
            }

            const tweet = result.element;

            // Extract hashtags and update counts
            const hashtags = extractHashtags(tweet);
            for (const hashtag of hashtags) {
                await redisClient.zIncrBy(HASHTAGS_SORTED_KEY, 1, hashtag);
            }

            performance.mark('end-process-tweet');
            performance.measure('Worker tweet processing completed. Duration:', 'start-process-tweet', 'end-process-tweet');
        } catch (error) {
            console.error('Error processing tweet in worker:', error);
        }
  }

}

processQueue();

module.exports = { extractHashtags }