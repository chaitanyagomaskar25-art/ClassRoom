import { Queue, Worker } from 'bullmq';
import env from '../config/env.js';

class BackgroundQueueService {
  constructor() {
    this.queues = new Map();
    this.workers = new Map();
    this.handlers = new Map();
    this.isRedisAvailable = false;

    const redisUrl = process.env.REDIS_URL || env.REDIS_URL;
    if (redisUrl) {
      try {
        const url = new URL(redisUrl);
        this.connection = {
          host: url.hostname || '127.0.0.1',
          port: Number(url.port) || 6379,
          password: url.password || undefined,
          lazyConnect: true,
          maxRetriesPerRequest: 1
        };
        this.isRedisAvailable = true;
      } catch {
        this.isRedisAvailable = false;
      }
    }
  }

  /**
   * Register a background task queue with its worker processor
   */
  registerQueue(queueName, processor) {
    this.handlers.set(queueName, processor);

    if (this.isRedisAvailable && this.connection) {
      try {
        const queue = new Queue(queueName, { connection: this.connection });
        const worker = new Worker(queueName, async (job) => {
          return await processor(job.data);
        }, { connection: this.connection, concurrency: 5 });

        worker.on('error', (err) => {
          console.warn(`BullMQ worker [${queueName}] warning:`, err.message);
        });

        this.queues.set(queueName, queue);
        this.workers.set(queueName, worker);
      } catch {
        // Fall back to immediate in-process queue
      }
    }
  }

  /**
   * Dispatch a background job
   */
  async add(queueName, jobName, data, options = {}) {
    const queue = this.queues.get(queueName);
    if (queue && this.isRedisAvailable) {
      try {
        return await queue.add(jobName, data, {
          attempts: options.attempts || 3,
          backoff: { type: 'exponential', delay: 1000 },
          removeOnComplete: true,
          removeOnFail: 50
        });
      } catch (err) {
        console.warn(`BullMQ push failed for [${queueName}], falling back to async execution:`, err.message);
      }
    }

    // In-process resilient fallback: execute on next tick without blocking
    setImmediate(async () => {
      const handler = this.handlers.get(queueName);
      if (typeof handler === 'function') {
        try {
          await handler(data);
        } catch (jobErr) {
          console.error(`Background job [${queueName}:${jobName}] failed:`, jobErr.message);
        }
      }
    });

    return { id: `local-${Date.now()}` };
  }
}

export const queueService = new BackgroundQueueService();
export default queueService;
