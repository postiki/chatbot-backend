import express, {Request, Response} from 'express';
import mongoose from 'mongoose';
import {Context, Telegraf} from "telegraf";
import {Configuration, OpenAIApi} from "openai";
import axios from 'axios';


const mongoUrl = 'mongodb://localhost:27017/mydatabase';
mongoose.connect(mongoUrl);
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'Ошибка соединения с MongoDB:'));
db.once('open', () => {
    console.log('Успешное подключение к MongoDB!');
});


interface UserInterface {
    username: string;
    chatId: number;
}

const userSchema = new mongoose.Schema<UserInterface>({
    username: {type: String, required: true},
    chatId: {type: Number, required: true},
});
const User = mongoose.model<UserInterface>('User', userSchema);


const configuration = new Configuration({
    organization: "org-thvBFUANUYseKPLbAFwsuWjA",
    apiKey: process.env.OPENAI_API_KEY || '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',
});
const openai = new OpenAIApi(configuration);
// // const response = await openai.listEngines();
const api_url = "https://api.openai.com/v1/chat/completions";

const postPrompt = async (message: string) => {
    const data = {
        model: 'gpt-3.5-turbo',
        messages: [{"role": "user", "content": `${message}`}],
        temperature: 0.7
    };

    try {
        const result:any = await axios.post(api_url, data, {
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


const token: string = '6019241051:AAH9wiZgq4Zi7uvX6-QcWxaOJVpEqVRRajY';
const bot: Telegraf<Context> = new Telegraf(token);
bot.start(async (ctx: Context): Promise<void> => {
    if (ctx.chat) {
        let chatUsername = '';
        if (ctx.chat.type === 'private') {
            chatUsername = ctx.chat.username || '';
        }
        const existingUser: UserInterface | null = await User.findOne({chatId: ctx.chat.id});

        if (!existingUser) {
            const user: UserInterface = await User.create({
                username: chatUsername,
                chatId: ctx.chat.id,
            });
            await ctx.reply('Привет! Я бот!');
        } else {
            await ctx.reply(`Привет, ${existingUser.username}!`);
        }
    }
});

bot.on('message', async (ctx: Context) => {
    const message: any = ctx.message;
    console.log(`Received message: ${message.text}`);

    const asyncResult = await postPrompt(message.text);

    await ctx.reply(asyncResult);
});

bot.launch();

const app = express();


const port = 3000;
app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});