import bot from "./bot/bot";
import mongoose from "mongoose";
import config from "./config";

mongoose.connect(config.mongoUrl);
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'Ошибка соединения с MongoDB!'));
db.once('open', () => {
    console.log('Успешное подключение к MongoDB!');
});

bot.launch()