import { Queue } from 'bullmq';
import { redis } from '../config/redis.js';

class QueueService {
  private queues: Map<string, Queue> = new Map();

  getQueue(name: string): Queue {
    if (!this.queues.has(name)) {
      this.queues.set(name, new Queue(name, {
        connection: redis
      }));
    }
    return this.queues.get(name)!;
  }

  async addJob(queueName: string, data: any) {
    const queue = this.getQueue(queueName);
    await queue.add('process', data, {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 5000
      }
    });
  }
}

export const queueService = new QueueService();
