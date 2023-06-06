"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.liquidationAlertsController = exports.telegramService = exports.redisService = void 0;
const RedisService_1 = require("./services/RedisService");
const TelegramService_1 = require("./services/TelegramService");
const LiquidationAlertsController_1 = require("./controllers/LiquidationAlertsController");
/*************************************
 * Dependencies setup
 *************************************/
/** Setup and connect to Redis */
exports.redisService = new RedisService_1.RedisService();
exports.redisService.setup();
/** Telegram Bot dependency */
exports.telegramService = new TelegramService_1.TelegramService();
/** Instantiate LiquidationAlertsController */
exports.liquidationAlertsController = new LiquidationAlertsController_1.LiquidationAlertsController();
