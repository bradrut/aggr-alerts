import { createClient } from 'redis';

export class RedisService {

  private redisClient;

  constructor() {
    this.redisClient = createClient();
    this.redisClient.on('error', err => console.log('Redis Client Error', err));
  }

  async setup() {
    await this.redisClient.connect();
  }

  async test() {
    await this.redisClient.set('key', 'value');
    const value = await this.redisClient.get('key');
    return "*** Successfully tested redis!";
  }

}
