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
db.on('error', console.error.bind(console, 'Ошибка соединения с MongoDB!'));
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
    },
    userCache: Array<string>;
    chatCache: Array<string>;
}

const userSchema = new mongoose.Schema<UserInterface>({
    username: {type: String, required: true},
    chatId: {type: Number, required: true},
    paid: {type: Boolean, default: false},
    subscriptionEndAt: {type: String, default: null},
    limits: {
        symbolTotal: {type: Number, default: 0}
    },
    userCache: [{type: String, default: null}],
    chatCache: [{type: String, default: null}]
});
const User = mongoose.model<UserInterface>('User', userSchema);

const api_url = "https://api.openai.com/v1/chat/completions";
const postPrompt = async (userHistory: Array<string>, chatHistory: Array<string>): Promise<string | undefined> => {
    const userMessages = userHistory.map(props => {
        return {"role": "user", "content": `${props}`}
    });
    const chatMessages = chatHistory.map(props => {
        return {"role": "assistant", "content": `${props}`}
    });

    function interleaveMessages(userMessages: { role: string, content: string }[], chatMessages: { role: string, content: string }[]): { role: string, content: string }[] {
        const result: { role: string, content: string }[] = [];
        const maxLength = Math.max(userMessages.length, chatMessages.length);
        for (let i = 0; i < maxLength; i++) {
            if (userMessages[i]) {
                result.push(userMessages[i]);
                console.log(userMessages[i])
            }
            if (chatMessages[i]) {
                result.push(chatMessages[i]);
                console.log(chatMessages[i]);
            }
        }
        return [...result];
    }


    const data = {
        model: 'gpt-3.5-turbo',
        messages: interleaveMessages(userMessages, chatMessages),
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
            const userMessages = user.userCache.length < 5 ? user.userCache : user.userCache.slice(-4)
            const chatMessages = user.chatCache.length < 5 ? user.chatCache : user.chatCache.slice(-4)

            if (user.limits.symbolTotal < 10000) {
                const result = await postPrompt(userMessages.concat([message.text]), chatMessages);
                await User.updateOne(
                    {chatId: chat?.id},
                    {
                        $inc: {"limits.symbolTotal": (message.text).length},
                        chatCache: chatMessages.concat(result || ['']),
                        userCache: userMessages.concat(message.text)
                    },
                )
                await ctx.reply(result || 'error');
            } else {
                await ctx.reply('Subscription end!')
            }
        }
    } catch (e) {
        console.error(e)
    }
});

bot.launch();