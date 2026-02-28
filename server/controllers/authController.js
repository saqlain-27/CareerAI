import { registerUser, loginUser } from '../services/authService.js';
import setTokenCookie from '../utils/setTokenCookie.js';

export const register = async (req, res, next) => {
    try {
        const { name, email, password } = req.body;

        const { user, token } = await registerUser(
            name,
            email,
            password
        );

        setTokenCookie(res, token);

        res.status(201).json({
            success: true,
            user,
        });
    } catch (error) {
        res.status(error.statusCode || 500);
        next(error);
    }
};

export const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        const { user, token } = await loginUser(email, password);

        setTokenCookie(res, token);

        res.status(200).json({
            success: true,
            user,
        });
    } catch (error) {
        res.status(error.statusCode || 500);
        next(error);
    }
};

export const logout = (req, res) => {
    res.cookie('token', '', {
        httpOnly: true,
        expires: new Date(0),
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'Strict',
    });

    res.status(200).json({
        success: true,
        message: 'Logged out successfully',
    });
};