import { Bot, InlineKeyboard } from "grammy";
import { Logger } from "pino";

const logger: Logger = require('pino')()

/**
 * See: https://core.telegram.org/bots/tutorial
 */

//Create a new bot
const bot = new Bot(process.env.TELEGRAM_BOT_TOKEN || "telegram_bot_token_not_found");

//This function would be added to the dispatcher as a handler for messages coming from the Bot API
bot.on("message", async (ctx) => {
  //Print to console
  console.log(
    `${ctx.from.first_name} wrote ${
      "text" in ctx.message ? ctx.message.text : ""
    }`,
  );
});

//Start the Bot
export default function startBot() {
  bot.start();
}

export async function sendTelegramAlertMessage(liquidationValue: number): Promise<void> {
  logger.info("Sending Telegram notification for liquidationValue: " + liquidationValue);
}
