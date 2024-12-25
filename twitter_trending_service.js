// This line must come before importing any instrumented module.
// const tracer = require('dd-trace').init()
const tracer = require('dd-trace').init({
    service: 'twitter_trending_service_api',
    env: 'production',
    hostname: 'localhost',  // Communicates with the Agent via the local APM port
    port: 8126,
    logInjection: true,
  });

const express = require('express');
const cluster = require('cluster')
const os = require('os')
const { createClient } = require('redis');
const crypto = require('crypto');
const { performance, PerformanceObserver } = require('perf_hooks');

const { tweetLimiter, trendingHashtagsLimiter } = require('./middleware/rateLimiters');
const { TWEET_QUEUE_KEY, PROCESSED_TWEETS_KEY, HASHTAGS_SORTED_KEY } = require('./constants');


// Observe performance entries
const obs = new PerformanceObserver((items) => {
    items.getEntries().forEach((entry) => {
        console.log(`${entry.name}: ${entry.duration}ms`);
    });
});
obs.observe({ entryTypes: ['measure'] });

function generateHash(tweet) {
    return crypto.createHash('sha256').update(tweet).digest('hex');
}

if (cluster.isMaster) {
    const numCPUs = os.cpus().length
    cluster.schedulingPolicy = cluster.SCHED_RR;

    for (let i = 0; i < numCPUs; i++) {
        cluster.fork()
    }

    cluster.on('exit', (worker, code, signal) => {
        console.log(`Worker ${worker.process.pid} exited with code ${code} and signal ${signal}`);
        cluster.fork()
    })
} else {
    const redisClient = createClient({
        url: `redis://${process.env.REDIS_HOST || 'localhost'}:${process.env.REDIS_PORT || 6379}`,
    });
    redisClient.connect().catch(console.error);

    const app = express();
    app.use(express.json());

    // POST /tweet endpoint
    app.post('/tweet', tweetLimiter, async (req, res) => {
        performance.mark('start-post-tweet');
        const { tweet } = req.body;
    
        if (!tweet) {
            return res.status(400).json({ error: 'Tweet is required' });
        }
    
        try {
            const tweetHash = generateHash(tweet);
    
            // Check if the tweet is already processed
            const isDuplicate = await redisClient.sIsMember(PROCESSED_TWEETS_KEY, tweetHash);
            if (isDuplicate) {
                return res.status(200).json({ message: 'Duplicate tweet, skipped processing.' });
            }
    
            // Add tweet to the queue and processed set
            await redisClient.sAdd(PROCESSED_TWEETS_KEY, tweetHash);
            await redisClient.rPush(TWEET_QUEUE_KEY, tweet); // Push to the Redis queue for the worker
    
            const successMessage = 'Tweet queued for processing.';
            performance.mark('end-post-tweet');
            performance.measure('POST /tweet duration', 'start-post-tweet', 'end-post-tweet');
            res.status(202).json({ message: successMessage});
        } catch (error) {
            console.error('Error in POST /tweet:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    });

    // GET /trending-hashtags endpoint
    app.get('/trending-hashtags', trendingHashtagsLimiter, async (req, res) => {
        try {
            // Get top 25 hashtags from the sorted set
            const trendingHashtags = await redisClient.zRangeWithScores(HASHTAGS_SORTED_KEY, -25, -1, { REV: true });

            res.status(200).json({
                hashtags: trendingHashtags.map((entry) => entry.value),
            });
        } catch (error) {
            console.error('Error in GET /trending-hashtags:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    });

    // Start the server
    app.listen(process.env.PORT, () => {
        console.log(`Server is running on http://localhost:${process.env.PORT}`);
    });

}