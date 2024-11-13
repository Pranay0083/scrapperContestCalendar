import jwt from 'jsonwebtoken';
import User from '../models/Users.js';

const authMiddleware = (roleRequired = 'user') => {
    return async (req, res, next) => {
        const token = req.headers.authorization?.split(' ')[1];

        if (!token) {
            return res.status(401).json({ message: 'Access Denied: No Token Provided!' });
        }

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const user = await User.findById(decoded.userId);

            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }

            if (roleRequired === 'admin' && user.role !== 'admin' && user._id.toString() !== req.params.id) {
                return res.status(403).json({ message: 'Access Denied: Insufficient privileges!' });
            }

            req.user = user;
            next();
        } catch (error) {
            res.status(400).json({ message: 'Invalid Token' });
        }
    };
};

export default authMiddleware;
