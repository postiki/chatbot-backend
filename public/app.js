"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const telegraf_1 = require("telegraf");
const axios_1 = __importDefault(require("axios"));
const dotenv = __importStar(require("dotenv"));
dotenv.config();
if (process.env.NODE_ENV === 'development') {
    dotenv.config({ path: '.env.development' });
}
else {
    dotenv.config({ path: '.env.production' });
}
const { MONGO_URL, TELEGRAM_API_KEY } = process.env;
console.log(MONGO_URL);
const mongoUrl = MONGO_URL;
mongoose_1.default.connect(mongoUrl || '');
const db = mongoose_1.default.connection;
db.on('error', console.error.bind(console, 'Ошибка соединения с MongoDB:'));
db.once('open', () => {
    console.log('Успешное подключение к MongoDB!');
});
const userSchema = new mongoose_1.default.Schema({
    username: { type: String, required: true },
    chatId: { type: Number, required: true },
});
const User = mongoose_1.default.model('User', userSchema);
const api_url = "https://api.openai.com/v1/chat/completions";
const postPrompt = (message) => __awaiter(void 0, void 0, void 0, function* () {
    const data = {
        model: 'gpt-3.5-turbo',
        messages: [{ "role": "user", "content": `${message}` }],
        temperature: 0.7
    };
    try {
        const result = yield axios_1.default.post(api_url, data, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.OPENAI_API_KEY || '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'}`
            }
        });
        return result.data.choices[0].message.content;
    }
    catch (e) {
        console.error(e);
    }
});
const token = TELEGRAM_API_KEY;
const bot = new telegraf_1.Telegraf(token || '');
bot.start((ctx) => __awaiter(void 0, void 0, void 0, function* () {
    if (ctx.chat) {
        let chatUsername = '';
        if (ctx.chat.type === 'private') {
            chatUsername = ctx.chat.username || '';
        }
        const existingUser = yield User.findOne({ chatId: ctx.chat.id });
        if (!existingUser) {
            const user = yield User.create({
                username: chatUsername,
                chatId: ctx.chat.id,
            });
            yield ctx.reply('Привет! Я бот!');
        }
        else {
            yield ctx.reply(`Привет, ${existingUser.username}!`);
        }
    }
}));
bot.on('message', (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    const message = ctx.message;
    const asyncResult = yield postPrompt(message.text);
    yield ctx.reply(asyncResult);
}));
bot.launch();
//# sourceMappingURL=app.js.map