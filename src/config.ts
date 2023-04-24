import * as dotenv from "dotenv";

dotenv.config()
if (process.env.NODE_ENV === 'development') {
  dotenv.config({path: '.env.development'});
} else {
  dotenv.config({path: '.env.production'});
}

export default {
  mongoUrl: process.env.MONGO_URL || '',
  telegramApiKey: process.env.TELEGRAM_API_KEY || '',
  frontUrl: process.env.PAYMENT_FRONT_URL || '',
  apiUrl: process.env.OPEN_AI_API_URL || '',
  apiKey: process.env.OPENAI_API_KEY || '',
};