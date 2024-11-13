import mongoose from "mongoose";
const { Schema, model } = mongoose;

const userSchema = new Schema({
    username: {
        type: String,
        required: true,
        unique: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true,
    },
    atCoder: {
        type: String,
    },
    codeChef: {
        type: String,
    },
    codeforces: {
        type: String,
    },
    codingNinjas: {
        type: String,
    },
    geeksForGeeks: {
        type: String,
    },
    leetCode: {
        type: String,
    }
}, { timestamps: true });

const User = model('User', userSchema);
export default User;
