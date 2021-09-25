import TelegramBot from "node-telegram-bot-api";

interface Command {
    alias: string[];
    command(bot: TelegramBot, msg:any, args: string[]): any;
}
interface Callback {
    command: string;
    callback(bot: TelegramBot, msg:any, args: string[]): any;
}

var command_list: Command[] = [];
var callback_list: Callback[] = [];

const BotCommands = {
    addCommand: (command: Command): number => {
        return command_list.push(command);
    },
    addCallback: (callback: Callback): number => {
        return callback_list.push(callback);
    },
    accept: (bot: TelegramBot, msg: any) => {
        let text: string = msg.text;
        let cmd: string = text.includes(' ') ? text.split(' ')[0] : text;
        text = text.substr(cmd.length + 1);
        var args = text.split(' ');
        command_list.forEach((command: Command) => {
            if (command.alias.includes(cmd)){
                command.command(bot, msg, args);
            }
        });
    },
    acceptCallback: (bot: TelegramBot, msg: any) => {
        let data: string = msg.data;
        let cmd: string = data.includes(' ') ? data.split(' ')[0] : data;
        data = data.substr(cmd.length + 1);
        var args = data.split(' ');
        callback_list.forEach((callback: Callback) => {
            if (callback.command == cmd.toLowerCase()){
                callback.callback(bot, msg, args);
            }
        });
    },
    arrayToString: (arr: String[]): string => {
        let s: string = "";
        arr.forEach(e => {
            if (e) s += " " + e;
        });
        if (s.startsWith(' ')) s = s.substr(1);
        return s;
    },
    generateMention: (name: string, id: string | number): string => {
        if (name.startsWith("@")) {
            name = name.substr(1, name.length);
            return `<a href="tg://resolve?domain=${name}">${name}</a>`;
        }
        if (id.toString().startsWith("@")) {
            return id+"";
        }
        return `<a href="tg://user?id=${id}">${name}</a>`;
    },
    getUserUsername: async (bot: TelegramBot, id: string | number): Promise<string> => {
        if (id.toString().startsWith("@")) return id.toString().substr(1);
        try {
            var r = (await bot.getChatMember(id, id+""))?.user?.username;
            if (r == undefined) throw "Is undefined";
            return r+"";
        } catch (e){
            if (typeof id === 'string') {
                return id+"";
            }
        }
        return "-";
    },
    getUserName: async (bot: TelegramBot, id: string | number): Promise<string> => {
        if (id.toString().startsWith("@")) return id+"";
        return (await bot.getChatMember(id, id+"")).user.first_name;
    },
    getUser: async (bot: TelegramBot, id: string | number): Promise<any> => {
        return (await bot.getChatMember(id, id+""));
    }
};

export = BotCommands;