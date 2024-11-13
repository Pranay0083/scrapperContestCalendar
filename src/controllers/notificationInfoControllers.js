import NotificationInfo from '../models/NotificationInfo.js';

// Set Telegram Username
export const setTelegramUsername = async (req, res) => {
    const { telegramUsername } = req.body;
    const userId = req.user._id; // Assuming `authMiddleware` attaches the authenticated user to req.user

    try {
        // Check if the user already has a Telegram username set
        let notificationInfo = await NotificationInfo.findOne({ userId });

        if (notificationInfo) {
            // Update existing record
            notificationInfo.telegramUsername = telegramUsername;
            await notificationInfo.save();
        } else {
            // Create a new record
            notificationInfo = new NotificationInfo({
                userId,
                telegramUsername
            });
            await notificationInfo.save();
        }

        res.status(200).json({ message: 'Telegram username set successfully', notificationInfo });
    } catch (error) {
        res.status(500).json({ message: `Error setting Telegram username: ${error.message}` });
    }
};
