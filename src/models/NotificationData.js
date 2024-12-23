import mongoose from "mongoose";
import { model, Schema } from "mongoose";

const notificationSchema = new Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Users'
    },
    message: {
        type: String,
        required: true,
        trim: true
    },
    time: {
        type: Date,
        required: true
    }
}, { timestamps: true });

const Notification = model('Notification', notificationSchema);
export default Notification
