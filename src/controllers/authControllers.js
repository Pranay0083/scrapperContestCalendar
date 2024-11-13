import User from '../models/Users.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// Signup function
export const signup = async (req, res) => {
    const { username, email, password } = req.body;

    try {
        
        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 12);

        // Create a new user
        const newUser = new User({
            username,
            email,
            password: hashedPassword
        });

        // Save the user to the database
        await newUser.save();

        // Create a JWT token
        const token = jwt.sign({ userId: newUser._id }, process.env.JWT_SECRET);

        res.status(201).json({ user: newUser, token });
    } catch (error) {
        res.status(500).json({ message: 'Something went wrong' });
    }
};

// Signin function
export const signin = async (req, res) => {
    const { email, password } = req.body;

    try {
        // Find the user by email
        const existingUser = await User.findOne({ email });
        if (!existingUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Check if the password is correct
        const isPasswordCorrect = await bcrypt.compare(password, existingUser.password);
        if (!isPasswordCorrect) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Create a JWT token
        const token = jwt.sign({ userId: existingUser._id }, process.env.JWT_SECRET);

        res.status(200).json({ user: existingUser, token });
    } catch (error) {
        res.status(500).json({ message: 'Something went wrong' });
    }
};

// Change password function
export const changePassword = async (req, res) => {
    const { email, oldPassword, newPassword } = req.body;

    try {
        // Find the user by email
        const existingUser = await User.findOne({ email });
        if (!existingUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Check if the old password is correct
        const isPasswordCorrect = await bcrypt.compare(oldPassword, existingUser.password);
        if (!isPasswordCorrect) {
            return res.status(400).json({ message: 'Incorrect current password' });
        }

        // Hash the new password
        const hashedNewPassword = await bcrypt.hash(newPassword, 12);

        // Update the user's password
        existingUser.password = hashedNewPassword;
        await existingUser.save();

        res.status(200).json({ message: 'Password changed successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Something went wrong' });
    }
};
