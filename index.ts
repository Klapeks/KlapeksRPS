import TelegramBot from "node-telegram-bot-api";
import BotCommands from "./scripts/bot_commands";
import DefaultCommands from "./scripts/default_commands";
import RockPaperScissors from "./scripts/rock_paper_scissors";

const TelegramAPI = require('node-telegram-bot-api');
const token = require('./configs/token');

const bot: TelegramBot = new TelegramAPI(token, {polling: true});
let bot_mention = "@"; bot.getMe().then(un => {
    bot_mention = "@" + un.username;
});

DefaultCommands.init();
RockPaperScissors.init();

bot.on('message', async (msg: any) => {
    if (msg.text.toString().startsWith(bot_mention+" ")) {
        msg.text = msg.text.toString().substr(bot_mention.length+1);
        msg.entities.shift();
    }
    BotCommands.accept(bot, msg);
});

bot.on('callback_query', async (msg: any) => {
    BotCommands.acceptCallback(bot, msg);
});

console.log("Bot was successfuly started :)");