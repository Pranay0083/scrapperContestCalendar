import mongoose from 'mongoose'; 
const { Schema, model } = mongoose;

const contestSchema = new Schema({
    event: {
        type: String,
        required: [true, 'Event name is required'],
    },
    resource: {
        type: String,
        required: [true, 'Resource is required'],
    },
    href: {
        type: String,
        required: [true, 'Link is required'],
    },
    date: {
        type: String,
        required: [true, 'Date is required'],
        trim: true
    },
    createdAt: {
        type: String,
        default: () => new Date().toISOString(),
        trim: true
    }
});

const Contest = model('Contest', contestSchema); 
export default Contest;