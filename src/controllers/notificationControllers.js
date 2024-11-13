import Notification from '../models/NotificationData.js';
import User from '../models/Users.js';

// Set notification
export const set = async (req, res) => {
    const { id } = req.params;
    const { telegramUsername, message } = req.body;

    try {
        // Check if user or admin exists
        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Create a new notification
        const newNotification = new Notification({
            userId: id,
            telegramUsername,
            message
        });

        // Save the notification to the database
        await newNotification.save();

        res.status(201).json({ message: 'Notification set successfully', notification: newNotification });
    } catch (error) {
        res.status(500).json({ message: `Error setting notification: ${error.message}` });
    }
};

// Get all notifications
export const getAll = async (req, res) => {
    try {
        const notifications = await Notification.find();
        res.status(200).json(notifications);
    } catch (error) {
        res.status(500).json({ message: `Error fetching notifications: ${error.message}` });
    }
};
