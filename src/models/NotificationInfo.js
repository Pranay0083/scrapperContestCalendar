import mongoose from "mongoose";
const { Schema, model } = mongoose;

const notificationInfoSchema = new Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Users'
    },
    telegramUsername: {
        type: String,
        required: true,
        trim: true
    }
}, { timestamps: true });

const NotificationInfo = model('NotificationInfo', notificationInfoSchema);

export default NotificationInfo;
