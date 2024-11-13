import User from '../../models/Users.js';
import NotificationInfo from '../../models/NotificationInfo.js';
import connectDB from '../../config/db.js';

const addUserToDb = async (chatId, email) => {
    try {
        connectDB()
        console.log(email)
        const user = await User.findOne({ email });
        if (!user) {
            return { err: "User does not exist" };
        }

        // Update or create notification info
        const notificationInfo = await new NotificationInfo({
            userId: user._id,
            telegramUsername: chatId,
        });
        await notificationInfo.save();
        return { success: "User registered successfully for Telegram notifications" };
    } catch (err) {
        console.error("Error registering user for Telegram notifications:", err);
        return { err: "Error registering user for Telegram notifications" };
    }
};

export default addUserToDb;