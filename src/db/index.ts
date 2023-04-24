import mongoose from "mongoose";

mongoose.connect(process.env.MONGO_URL || '');
export const db = mongoose.connection;
db.on('error', console.error.bind(console, 'Ошибка соединения с MongoDB!'));
db.once('open', () => {
    console.log('Успешное подключение к MongoDB!');
});