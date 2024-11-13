import dotenv from 'dotenv';
import TelegramBot from 'node-telegram-bot-api';
import addUserToDb from './functions/addUser.js';

dotenv.config();

const token = process.env.TELEGRAM_BOT_TOKEN;
const bot = new TelegramBot(token, { polling: true });

bot.onText(/\/start/, (msg) => {
    bot.sendMessage(msg.chat.id, "Welcome to the bot! Use /register to register your email address.");
});

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

bot.onText(/\/register/, (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, "Please enter your email address:");

    const takeMail = async () => {
        bot.once('message', async (msg) => {
            const email = msg.text;
            if (emailRegex.test(email)) {
                const status = await addUserToDb(chatId, email);
                console.log(status);
                if (status.err) {
                    bot.sendMessage(chatId, "Error registering email. Please try again.");
                    takeMail();
                } else {
                    bot.sendMessage(chatId, "You will now receive notifications from this bot.");
                }
            } else {
                bot.sendMessage(chatId, "Invalid email format. Please try again.");
                takeMail();
            }
        });
    };
    takeMail();
});

bot.on('message', (msg) => {
    if (!msg.text.startsWith('/') && !emailRegex.test(msg.text)) {
        bot.sendMessage(msg.chat.id, "I am not taking any inputs for now other than /register. Please type /register to register your email address.");
    }
});

export default bot;