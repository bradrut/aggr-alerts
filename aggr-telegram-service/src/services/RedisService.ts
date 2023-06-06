import { Logger } from 'pino';
import { createClient } from 'redis';
import { ApiError, HTTP_STATUS } from '../types/ApiError';

const logger: Logger = require('pino')()
const REDIS_EX_TTL: number = 86400; // TTL (in seconds) for Redis records, to be evicted using volatile-ttl eviction policy (see redis.conf)
                                    // Currently: 24hrs
const REDIS_HOST: string = process.env.REDIS_HOST || 'redis';
const REDIS_PORT = process.env.REDIS_PORT || 6379;

export class RedisService {

  private redisClient;

  constructor() {
    logger.info('Attempting to connect to Redis at ' + REDIS_HOST + ':' + REDIS_PORT);
    let redisUrl = 'redis://' + REDIS_HOST + ':' + REDIS_PORT + '/0';
    this.redisClient = createClient({ url: redisUrl });
    this.redisClient.on('error', err => console.log('Redis Client Error', err));
  }

  async setup() {
    await this.redisClient.connect();
  }

  async getCachedLiquidation(liquidationValue: number): Promise<string | null> {
    logger.debug("Retreiving cached liquidation from liquidationValue: " + liquidationValue);
    try {
      return await this.redisClient.get(liquidationValue.toString());
    } catch(err) {
      logger.error(err, 'Unexpected error encountered while attempting to get cached liquidation');
      throw new ApiError(HTTP_STATUS.INTERNAL_SERVER_ERROR, 'Unexpected error encountered while attempting to get cached liquidation');
    }
  }

  async setCachedLiquidation(liquidationValue: number): Promise<string | null> {
    if (!liquidationValue) {
      logger.error(liquidationValue, "Could not set cached liquidation becaues liquidationValue is zero or undefined");
      throw new Error("Could not set cached liquidation becaues liquidationValue is zero or undefined");
    }
    logger.debug("Caching liquidationValue: " + liquidationValue);
    return await this.redisClient.set(liquidationValue.toString(), liquidationValue.toString(), { EX: REDIS_EX_TTL });
  }

}
