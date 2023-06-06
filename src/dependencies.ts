import { RedisService } from './services/RedisService';
import { TelegramService } from './services/TelegramService';
import { LiquidationAlertsController } from './controllers/LiquidationAlertsController';


/*************************************
 * Dependencies setup
 *************************************/

/** Setup and connect to Redis */
export const redisService = new RedisService();
redisService.setup();

/** Telegram Bot dependency */
export const telegramService = new TelegramService();

/** Instantiate LiquidationAlertsController */
export const liquidationAlertsController = new LiquidationAlertsController();
