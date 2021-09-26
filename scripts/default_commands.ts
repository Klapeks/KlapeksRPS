import TelegramBot from "node-telegram-bot-api";
import BotCommands from "./bot_commands";

let DefaultCommands = {
    init: () => {
        BotCommands.addCommand({
            alias: ["/start"],
            command: async (bot: TelegramBot, msg: any, args: string[]) => {
                await bot.sendMessage(msg.chat.id, 'Привет. Я просто бот который позволяет играть в камень-ножницы-бумага.');
            }
        });
        BotCommands.addCommand({
            alias: ["/sayz"],
            command: async (bot: TelegramBot, msg: any, args: string[]) => {
                bot.deleteMessage(msg.chat.id, msg.message_id);
                await bot.sendMessage(msg.chat.id, BotCommands.arrayToString(args), {parse_mode: "HTML"});
            }
        });
        BotCommands.addCommand({
            alias: ["/say"],
            command: async (bot: TelegramBot, msg: any, args: string[]) => {
                bot.deleteMessage(msg.chat.id, msg.message_id);
                await bot.sendMessage(msg.chat.id, BotCommands.arrayToString(args));
            }
        });
        BotCommands.addCommand({
            alias: ["/logit"],
            command: async (bot: TelegramBot, msg: any, args: string[]) => {
                console.log('\n\n\n');
                console.log(msg);
                return bot.sendMessage(msg.chat.id, `Ok, ${BotCommands.generateMention(msg.from.first_name, msg.from.id)}`, 
                    {reply_to_message_id: msg.message_id, parse_mode: "HTML"});
            }
        });
        BotCommands.addCommand({
            alias: [".close", ".r"],
            command: async (bot: TelegramBot, msg: any, args: string[]) => {
                if ((await bot.getChatMember(msg.chat.id, msg.from.id)).status === 'creator' || !(msg.chat.type === 'supergroup')){
                    console.log("\n\n\n\n\n\n\n\n\n\n\n\n\n");
                    console.log(msg);
                    console.log("Restarting....");
                    await bot.deleteMessage(msg.chat.id, msg.message_id)
                    setTimeout(function() {
                        process.exit();
                    }, 1000);
                }
            }
        });
    }
}
export = DefaultCommands;