"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TelegramService = void 0;
const grammy_1 = require("grammy");
const logger = require('pino')();
class TelegramService {
    constructor() {
        this.botToken = '';
        this.chatId = '';
        this.setupEnvironmentVariables();
        this.bot = new grammy_1.Bot(this.botToken);
        this.setupBotHandlers(this.bot);
        logger.info("Starting Telegram AggrAlertBot...");
        this.bot.start();
    }
    setupEnvironmentVariables() {
        if (process.env.TELEGRAM_BOT_TOKEN) {
            this.botToken = process.env.TELEGRAM_BOT_TOKEN;
        }
        else {
            logger.error("Telegram bot could not be started because TELEGRAM_BOT_TOKEN environment variable was not found");
            throw new Error("Telegram bot could not be started because TELEGRAM_BOT_TOKEN environment variable was not found");
        }
        if (process.env.TELEGRAM_BOT_CHAT_ID) {
            this.chatId = process.env.TELEGRAM_BOT_CHAT_ID;
        }
        else {
            logger.error("Telegram bot could not be started because TELEGRAM_BOT_TOKEN environment variable was not found");
            throw new Error("Telegram bot could not be started because TELEGRAM_BOT_TOKEN environment variable was not found");
        }
    }
    setupBotHandlers(bot) {
        //This function would be added to the dispatcher as a handler for messages coming from the Bot API
        this.bot.on("channel_post", (ctx) => __awaiter(this, void 0, void 0, function* () {
            this.bot.api.sendMessage(this.chatId, "Sorry, I am not programmed to handle incoming messages.\nIf you'd like a custom feature added, please contact Brad at:\nrutkowski.bradley@gmail.com");
        }));
    }
    sendTelegramAlertMessage(surpassedThreshold, liquidationValue) {
        return __awaiter(this, void 0, void 0, function* () {
            logger.info("Sending Telegram notification for liquidationValue: " + liquidationValue);
            return this.bot.api.sendMessage(this.chatId, "AGGR has reported a liquidation of:\n<b>" + liquidationValue + "</b>\n\nwhich surpassed your alert threshold of " + surpassedThreshold + ".", { parse_mode: 'HTML' });
        });
    }
}
exports.TelegramService = TelegramService;
