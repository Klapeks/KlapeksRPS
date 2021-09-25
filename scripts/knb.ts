import TelegramBot, { InlineKeyboardMarkup } from "node-telegram-bot-api";

const invites: any = [];


const knb = {
    keyboradInvite: {
        inline_keyboard: [
            [
                {text:'Принять', switch_inline_query_current_chat: 'кнб принять'},
                {text:'Отклонить', switch_inline_query_current_chat: 'кнб отклонить'}
            ]
        ]
    },
    getKmnByFromer: (username_from: string): any => {
        var user_to: any;
        Object.keys(invites).forEach((key: any) => {
            if (invites[key] && invites[key].from.username === username_from){
                if (user_to) return;
                user_to = key;
            }
        });
        return user_to;
    },
    knbCommandAlias: ['кнб', 'кмн', 'rvy', 'ry,', 'kmn', 'knb', 'лти', 'льт'],
    doKnb: async (bot: TelegramBot, msg: any): Promise<boolean> => {
        let text: string = msg.text;
        const chatId = msg.chat.id;

        let cmd = text.includes(" ") ? text.split(' ')[0].toLowerCase() : text.toLowerCase();
        if (!knb.knbCommandAlias.includes(cmd)) return false;

        let user_from = msg.from;
        user_from.name = user_from.first_name;

        if (text.includes(' ')) {
            text = text.substr(cmd.length+1);
            if (text.toLowerCase() === 'принять'){
                return true;
            } else if (text.toLowerCase() === 'отклонить') {
                if (invites[user_from.username]) {
                    delete invites[user_from.username];
                } else {
                    let e = knb.getKmnByFromer(user_from.username);
                    if (e) delete invites[e];
                    else {
                        await bot.sendMessage(chatId, 'Игры не существует');
                        return true;
                    }
                }
                await bot.sendMessage(chatId, 'Игра была отклонена');
                return true;
            }
        } else text = text.substr(cmd.length+1);

        let user_to = {username: '-', name: '-'}
        {
            let userto_id: number | string = -1;
    
            if (msg.reply_to_message) { // Ответ
                userto_id = msg.reply_to_message.from.id;
            } 
            else if (msg.entities) {
                msg.entities.forEach((el: any) => {
                    if (el.type === 'mention') { // Упоминание
                        userto_id = text.substr(el.offset, el.length);
                    }
                    if (el.type === 'text_mention') { // Упоминание текстом
                        userto_id = el.user.id;
                    }
                });
                if (userto_id === -1) {
                    await bot.sendMessage(chatId, 'Укажите пожалуйста пользователя!');
                    return true;
                }
            } else {
                await bot.sendMessage(chatId, 'Укажите пожалуйста пользователя!');
                return true;
            }
            // user_to.username = await knb.getUserUsername(bot, userto_id);
            // user_to.name = knb.generateMention(await knb.getUserName(bot, userto_id), userto_id);
        }

        if (user_to.name === "-") {
            await bot.sendMessage(chatId, 'Укажите пожалуйста пользователя!');
            return true;
        }

        if (invites[user_to.username]) {
            await bot.sendMessage(chatId, `❌ ${user_to.name}, уже вызван на камень\\-ножницы\\-бумага`, {parse_mode: "MarkdownV2"});
            delete invites[user_to.username];
            return true;
        }
        invites[user_to.username] = {
            to: user_to,
            from: user_from
        };
        await bot.sendMessage(chatId, `Эй, ${user_to.name}, тебя вызвали на камень\\-ножницы\\-бумага`, {parse_mode: "MarkdownV2", reply_markup: knb.keyboradInvite});
        
        return true;
    }
};

module.exports = knb;