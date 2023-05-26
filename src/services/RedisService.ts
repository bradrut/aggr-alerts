import { Logger } from 'pino';
import { createClient } from 'redis';

const logger: Logger = require('pino')()

export class RedisService {

  private redisClient;

  constructor() {
    this.redisClient = createClient();
    this.redisClient.on('error', err => console.log('Redis Client Error', err));
  }

  async setup() {
    await this.redisClient.connect();
  }

  async getCachedLiquidation(liquidationValue: number): Promise<string | null> {
    if (!liquidationValue) {
      logger.error(liquidationValue, "Could not get cached liquidation becaues liquidationValue is zero or undefined");
      throw new Error("Could not get cached liquidation becaues liquidationValue is zero or undefined");
    }
    logger.debug("Retreiving cached liquidation from liquidationValue: " + liquidationValue);
    return await this.redisClient.get(liquidationValue.toString());
  }

  async setCachedLiquidation(liquidationValue: number): Promise<string | null> {
    if (!liquidationValue) {
      logger.error(liquidationValue, "Could not set cached liquidation becaues liquidationValue is zero or undefined");
      throw new Error("Could not set cached liquidation becaues liquidationValue is zero or undefined");
    }
    logger.debug("Setting cached liquidation for liquidationValue: " + liquidationValue);
    return await this.redisClient.set(liquidationValue.toString(), liquidationValue.toString());
  }

}
