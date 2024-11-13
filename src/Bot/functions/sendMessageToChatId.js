import bot from '../bot/bot.js';

const sendMessageToChatId = async (chatId, message) => {
    try {
        await bot.sendMessage(chatId, message);
        await bot.sendMessage(chatId, "Thanks for using the service!");
        return { success: "Message sent successfully" };
    } catch (error) {
        console.error("Error sending message:", error);
        return { err: "Error sending message" };
    }
};

export default sendMessageToChatId;