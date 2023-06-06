import { Bot } from "grammy";
import { Message } from "grammy/types";
import { Logger } from "pino";

const logger: Logger = require('pino')()

export class TelegramService {

  private botToken: string = '';
  private chatId: string = '';
  private bot: Bot;

  constructor() {
    this.setupEnvironmentVariables();
    this.bot = new Bot(this.botToken);
    this.setupBotHandlers(this.bot);

    logger.info("Starting Telegram AggrAlertBot...");
    this.bot.start();
  }

  setupEnvironmentVariables() {
    if (process.env.TELEGRAM_BOT_TOKEN) {
      this.botToken = process.env.TELEGRAM_BOT_TOKEN;
    } else {
      logger.error("Telegram bot could not be started because TELEGRAM_BOT_TOKEN environment variable was not found");
      throw new Error("Telegram bot could not be started because TELEGRAM_BOT_TOKEN environment variable was not found");
    }

    if (process.env.TELEGRAM_BOT_CHAT_ID) {
      this.chatId = process.env.TELEGRAM_BOT_CHAT_ID;
    } else {
      logger.error("Telegram bot could not be started because TELEGRAM_BOT_TOKEN environment variable was not found");
      throw new Error("Telegram bot could not be started because TELEGRAM_BOT_TOKEN environment variable was not found");
    }
  }

  setupBotHandlers(bot: Bot) {
    //This function would be added to the dispatcher as a handler for messages coming from the Bot API
    this.bot.on("channel_post", async (ctx) => {
      this.bot.api.sendMessage(this.chatId,
                               "Sorry, I am not programmed to handle incoming messages.\nIf you'd like a custom feature added, please contact Brad at:\nrutkowski.bradley@gmail.com");
    });
  }

  async sendTelegramAlertMessage(surpassedThreshold: number, liquidationValue: number): Promise<Message.TextMessage> {
    logger.info("Sending Telegram notification for liquidationValue: " + liquidationValue);
    return this.bot.api.sendMessage(this.chatId,
                                    "AGGR has reported a liquidation of:\n<b>" + liquidationValue + "</b>\n\nwhich surpassed your alert threshold of " + surpassedThreshold + ".",
                                    { parse_mode: 'HTML' });
  }
}
