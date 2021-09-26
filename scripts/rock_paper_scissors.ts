import TelegramBot from "node-telegram-bot-api";
import { from } from "request/node_modules/form-data";
import BotCommands from "./bot_commands";

const keyboradInvite = {
    inline_keyboard: [
        [
            {text:'Принять', switch_inline_query_current_chat: 'кнб принять'},
            {text:'Отклонить', switch_inline_query_current_chat: 'кнб отклонить'}
        ]
    ]
};

const keyboradRPS = {
    inline_keyboard: [
        [
            {text:'Камень', callback_data: 'rps dogame rock'},
            {text:'Ножницы', callback_data: 'rps dogame scissors'},
            {text:'Бумага', callback_data: 'rps dogame paper'}
        ]
    ]
}
const questions = ["кто","кого","кем","кому"];

let invites: any = {}; // id: to

function getKmnByFromer(chatId: string | number, username_from: number): any {
    let user_to: any;
    let a = invites[chatId];
    if (!a) a = invites[chatId] + '';
    if (!a) return user_to;

    Object.keys(a).forEach((key: any) => {
        if (a[key] && a[key].from === username_from){
            if (user_to) return;
            user_to = key;
        }
    });
    return user_to;
}
function getId(user: any) {
    return user.username ? user.username.toLowerCase() : user.id;
}

let RockPaperScissors = {
    init: () => {
        BotCommands.addCallback({
            command: "rps",
            callback: async (bot: TelegramBot, msg: any, args: string[]) => {
                let chatId = msg.message.chat.id;
                if (!invites[chatId]) return;

                let e: any;
                if (invites[chatId]) {
                    if (invites[chatId][msg.from.username.toLowerCase()]) {
                        e = msg.from.username.toLowerCase();
                    } else {
                        e = getKmnByFromer(chatId, msg.from.id)?.toLowerCase();
                    }
                } 
                
                if (args[0] === "dogame") {
                    if (e && invites[chatId][e]) {
                        let status = invites[chatId][e].status;
                        if (status === "ingame") {
                            invites[chatId][e].status = `hit ${args[1]} ${msg.from.id}`;
                            
                            let responseText = `${BotCommands.generateMention(msg.from.first_name, msg.from.id)} сделал ставку.`;
                            if (!(invites[chatId][e].question === '-noquestion')){
                                responseText += "\n" + invites[chatId][e].question;
                            }

                            await bot.editMessageText(responseText, {
                                chat_id: msg.message.chat.id,
                                message_id: msg.message.message_id,
                                parse_mode: "HTML",
                                reply_markup: keyboradRPS
                            });
                            await bot.answerCallbackQuery(msg.id);
                            return;
                        } else if (status.startsWith("hit")) {
                            let userid = status.split(' ')[2];
                            // if (userid == msg.from.id) {
                            //     console.log("ahaha nezya");
                            //     await bot.answerCallbackQuery(msg.id);
                            //     return;
                            // }
                            status = status.split(' ')[1];
                            let mystatus = args[1];
                            async function doWon(user: any, how: string) {
                                let questionText = invites[chatId][e].question;
                                if (questionText === '-noquestion') {
                                    questionText = "Победил";
                                } else {
                                    let q = questionText.split(' ')[0].toLowerCase();
                                    if (questions.includes(q)){
                                        questionText = questionText.substr(q.length+1);
                                    }
                                    questionText = questionText.substr(0,1).toUpperCase() + questionText.substr(1);
                                    if (questionText.endsWith("?")) {
                                        questionText = questionText.substr(0, questionText.length-1);
                                    }
                                }
                                if (!user.id) user.id = user.user.id;
                                if (!user.first_name) user.first_name = user.user.first_name;
                                await bot.editMessageText(how + `\n${questionText}: ${BotCommands.generateMention(user.first_name, user.id)}`, {
                                    chat_id: msg.message.chat.id,
                                    message_id: msg.message.message_id,
                                    parse_mode: "HTML"
                                });
                                delete invites[chatId][e];
                                return;
                            }
                            if (mystatus === status) {
                                await bot.editMessageText("Победила дружба :)", {
                                    chat_id: msg.message.chat.id,
                                    message_id: msg.message.message_id
                                });
                            } 
                            else if (mystatus === 'paper' && status === 'rock') {
                                doWon(msg.from, "Бумага накрывает камень");
                            } 
                            else if (mystatus === 'paper' && status === 'scissors') {
                                BotCommands.getUser(bot, userid).then(un => {
                                    doWon(un, "Ножницы режут бумагу");
                                })
                            } 
                            else if (mystatus === 'rock' && status === 'scissors') {
                                doWon(msg.from, "Ножницы ломаются о камень");
                            } 
                            else if (mystatus === 'rock' && status === 'paper') {
                                BotCommands.getUser(bot, userid).then(un => {
                                    doWon(un, "Бумага накрывает камень");
                                })
                            } 
                            else if (mystatus === 'scissors' && status === 'paper') {
                                doWon(msg.from, "Ножницы режут бумагу");
                            } 
                            else if (mystatus === 'scissors' && status === 'rock') {
                                BotCommands.getUser(bot, userid).then(un => {
                                    doWon(un, "Ножницы ломаются о камень");
                                })
                            }
                        }
                    } else {
                        await bot.sendMessage(chatId, 'Игры не существует либо она не с вами');
                        await bot.answerCallbackQuery(msg.id);
                        return;
                    }
                }
                await bot.answerCallbackQuery(msg.id);
            }
        });
        BotCommands.addCommand({
            alias: ["кнб", "кмн", "rps", "kmn", "knb"],
            command: async (bot: TelegramBot, msg: any, args: string[]) => {
                const chatId = msg.chat.id;

                if (args[0].toLowerCase() === 'отклонить') {
                    let e: any;
                    if (invites[msg.chat.id]) {
                        if (invites[msg.chat.id][msg.from.username.toLowerCase()]) {
                            e = msg.from.username.toLowerCase();
                        } else {
                            e = getKmnByFromer(msg.chat.id, msg.from.id)?.toLowerCase();
                        }
                    }
                    if (e && invites[msg.chat.id][e]) {
                        if (invites[msg.chat.id][e].status === 'invite') {
                            delete invites[msg.chat.id][e];
                            await bot.sendMessage(chatId, 'Игра была отклонена');
                            return;
                        } else {
                            await bot.sendMessage(chatId, 'Игра уже запущена и не может быть отклонена!');
                            return;
                        }
                    } else {
                        await bot.sendMessage(chatId, 'Игры не существует');
                        return;
                    }
                }
                else if (args[0].toLowerCase() === 'принять') {
                    if (invites[msg.chat.id] && invites[msg.chat.id][msg.from.username.toLowerCase()]) {
                        let aboba = invites[msg.chat.id][msg.from.username.toLowerCase()];
                        if (!(aboba.status === 'invite')) {
                            await bot.sendMessage(chatId, 'Игра уже запущена и не может быть отклонена!');
                            return;
                        }
                        let fromuser = await BotCommands.getUser(bot, aboba.from);

                        let responseText = `${BotCommands.generateMention(msg.from.first_name, msg.from.id)} и ` + 
                                `${BotCommands.generateMention(fromuser.user.first_name, fromuser.user.id)} столкнулись в поединке!`;

                        if (!(aboba.question === '-noquestion')){
                            responseText += "\n" + aboba.question;
                        }
                        aboba.status = "ingame";
                        await bot.sendMessage(chatId, responseText, {parse_mode: "HTML", reply_markup: keyboradRPS});
                    } else {
                        await bot.sendMessage(chatId, 'Игры не существует либо она не с вами');
                    }
                    return;
                }
                else if (args[0].toLowerCase() === 'list'){
                    console.log(invites);
                    return;
                }
                
                let questionText: string = "-";

                let user_to = {username: "-", first_name: "-", id: "-"};
                if (msg.reply_to_message) { // Reply
                    user_to = msg.reply_to_message.from;
                }
                else if (args[0].startsWith("@")) { // Упоминание
                    args[0] = args[0].substr(1);
                    user_to = {
                        username: args[0],
                        first_name: args[0],
                        id: "@" + args[0]
                    };
                    delete args[0];
                }
                else if (msg.entities) {
                    msg.entities.forEach((el: any) => {
                        if (el.type === 'text_mention') { // Упоминание текстом
                            user_to = el.user;
                        }
                    });
                    if (user_to.id === "-" || user_to.username === "-" || user_to.first_name === "-") {
                        await bot.sendMessage(chatId, 'Укажите пожалуйста пользователя!');
                        return true;
                    }
                }
                else {
                    await bot.sendMessage(chatId, 'Укажите пожалуйста пользователя!');
                    return true;
                }
                let responseMessage: string = `Эй, ${BotCommands.generateMention(user_to.first_name, user_to.id)}, тебя вызвали на камень-ножницы-бумага`;
                questionText = BotCommands.arrayToString(args);
                if (questionText) {
                    responseMessage += `\n${questionText}`;
                    
                    // let q = questionText.split(' ')[0].toLowerCase();
                    // if (questions.includes(q)){
                    //     questionText = questionText.substr(q.length+1);
                    // }
                    questionText = questionText.substr(0,1).toUpperCase() + questionText.substr(1);
                    // if (questionText.endsWith("?")) {
                    //     questionText = questionText.substr(0, questionText.length-1);
                    // }
                } else {
                    questionText = "-noquestion";
                }

                if (!invites[chatId]) invites[chatId] = [];
                invites[chatId][user_to.username.toLowerCase()] = {
                    status: 'invite',
                    from: msg.from.id,
                    question: questionText
                };

                await bot.sendMessage(chatId, responseMessage, {parse_mode: "HTML", reply_markup: keyboradInvite});
            }
        });
    }
};

export = RockPaperScissors;