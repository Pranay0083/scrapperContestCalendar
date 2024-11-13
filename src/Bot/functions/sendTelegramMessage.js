import User from '../models/Users.js';
import NotificationInfo from '../models/NotificationInfo.js';
import bot from '../bot/bot.js';

const sendMessage = async (id, message) => {
    try {
        const user = await User.findById(id);
        if (!user) {
            return { err: "User not found" };
        }

        const notificationInfo = await NotificationInfo.findOne({ userId: user._id });
        if (!notificationInfo || !notificationInfo.telegramUsername) {
            return { err: "Telegram not found" };
        }

        const chatId = notificationInfo.telegramUsername;
        await bot.sendMessage(chatId, message); // Ensure you await the sendMessage call
        return { success: "Message sent successfully" };
    } catch (err) {
        console.error(`Error: ${err}`);
        return { err: "Error sending message" };
    }
}

export default sendMessage;