import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const protect = async (req, res, next) => {
    try {
        const token = req.cookies.token;

        if (!token) {
            res.status(401);
            throw new Error('Not authorized, no token');
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // const user = await User.findById(decoded.id).select('-password');

        // if (!user) {
        //     res.status(401);
        //     throw new Error('User not found');
        // }

        // req.user = user;

        req.user = decoded;

        next();
    } catch (error) {
        res.status(401);
        next(error);
    }
};