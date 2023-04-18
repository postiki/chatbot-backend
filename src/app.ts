import mongoose from 'mongoose';
import {Context, Markup, Telegraf} from "telegraf";
import axios from 'axios';
import * as dotenv from 'dotenv'


dotenv.config()
if (process.env.NODE_ENV === 'development') {
    dotenv.config({path: '.env.development'});
} else {
    dotenv.config({path: '.env.production'});
}
const {MONGO_URL, TELEGRAM_API_KEY} = process.env;


const mongoUrl = MONGO_URL;
mongoose.connect(mongoUrl || '');
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'Ошибка соединения с MongoDB:'));
db.once('open', () => {
    console.log('Успешное подключение к MongoDB!');
});


interface UserInterface {
    username: string;
    chatId: number;
    paid: boolean;
    subscriptionEndAt: string;
    limits: {
        symbolTotal: number;
    }
}

const userSchema = new mongoose.Schema<UserInterface>({
    username: {type: String, required: true},
    chatId: {type: Number, required: true},
    paid: {type: Boolean, default: false},
    subscriptionEndAt: {type: String, default: null},
    limits: {
        symbolTotal: {type: Number, default: 0}
    }
});
const User = mongoose.model<UserInterface>('User', userSchema);


const api_url = "https://api.openai.com/v1/chat/completions";
const postPrompt = async (message: string) => {
    const data = {
        model: 'gpt-3.5-turbo',
        messages: [{"role": "user", "content": `${message}`}],
        temperature: 0.7
    };

    try {
        const result: any = await axios.post(api_url, data, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.OPENAI_API_KEY || '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'}`
            }
        })

        return result.data.choices[0].message.content
    } catch (e) {
        console.error(e)
    }
}


const token: string | undefined = TELEGRAM_API_KEY;
const bot: Telegraf<Context> = new Telegraf(token || '');
bot.start(async (ctx: Context): Promise<void> => {
    if (ctx.chat) {
        let chatUsername = '';
        if (ctx.chat.type === 'private') {
            chatUsername = ctx.chat.username || '';
        }
        const existingUser: UserInterface | null = await User.findOne({chatId: ctx.chat.id});

        if (!existingUser) {
            await User.create({
                username: chatUsername,
                chatId: ctx.chat.id,
            });

            await ctx.reply('Привет! Я бот!');
        } else {
            await ctx.reply(`Привет, ${existingUser.username}!`);
        }
    }
});

bot.command('payment', async (ctx: Context) => {
    await ctx.reply('de', Markup.inlineKeyboard([
        [Markup.button.url('linktext', 'google.com')]
    ]));
})

bot.on('message', async (ctx: Context) => {
    const message: any = ctx.message
    const chat = ctx.chat
    try {
        const user = await User.findOne({chatId: chat?.id})
        if (user) {
            if (user.limits.symbolTotal < 10000) {
                const result = await postPrompt(message.text);
                await User.updateOne(
                    {chatId: chat?.id},
                    {$inc: {"limits.symbolTotal": (message.text).length}},
                )
                await ctx.reply(result);
            } else {
                await ctx.reply('Subscription end!')
            }
        }
    } catch (e) {
        console.error(e)
    }
});

bot.launch();