import { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { loginUser, registerUser, logoutUser } from '../services/authService';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    // Theme state
    const [theme, setTheme] = useState(() => {
        if (typeof window !== 'undefined' && window.localStorage) {
            const storedPrefs = window.localStorage.getItem('color-theme');
            if (typeof storedPrefs === 'string') {
                return storedPrefs;
            }
            const userMedia = window.matchMedia('(prefers-color-scheme: dark)');
            if (userMedia.matches) {
                return 'dark';
            }
        }
        return 'light'; // fallback
    });

    // Handle Theme changes
    useEffect(() => {
        const root = window.document.documentElement;
        root.classList.remove('light', 'dark');
        root.classList.add(theme);
        localStorage.setItem('color-theme', theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme(theme === 'dark' ? 'light' : 'dark');
    };

    // Check user session on initial load
    useEffect(() => {
        const checkAuth = async () => {
            try {
                // If we had a /me endpoint we'd call it here.
                // For now, if there's a user object in local storage, we'll restore it.
                // (The actual JWT is safe in the HTTP-Only cookie)
                const storedUser = localStorage.getItem('user');
                if (storedUser) {
                    setUser(JSON.parse(storedUser));
                }
            } catch (error) {
                console.error('Auth check failed:', error);
            } finally {
                setLoading(false);
            }
        };
        checkAuth();
    }, []);

    // Listen for global 401 Unauthorized events from the Axios interceptor
    useEffect(() => {
        const handleUnauthorized = () => {
            if (user) { // Only show toast if they were actually logged in
                setUser(null);
                localStorage.removeItem('user');
                toast.error('Session expired. Please log in again.');
                navigate('/login');
            }
        };

        window.addEventListener('auth:unauthorized', handleUnauthorized);
        return () => window.removeEventListener('auth:unauthorized', handleUnauthorized);
    }, [navigate, user]);

    const login = async (email, password) => {
        try {
            const data = await loginUser(email, password);
            setUser(data.user);
            localStorage.setItem('user', JSON.stringify(data.user));
            toast.success('Successfully logged in!');
            return true;
        } catch (error) {
            toast.error(error.response?.data?.message || 'Login failed');
            return false;
        }
    };

    const register = async (name, email, password) => {
        try {
            const data = await registerUser(name, email, password);
            setUser(data.user);
            localStorage.setItem('user', JSON.stringify(data.user));
            toast.success('Registration successful!');
            return true;
        } catch (error) {
            toast.error(error.response?.data?.message || 'Registration failed');
            return false;
        }
    };

    const logout = async () => {
        try {
            await logoutUser();
            setUser(null);
            localStorage.removeItem('user');
            toast.success('Logged out');
        } catch (error) {
            toast.error('Logout failed');
        }
    };

    return (
        <AuthContext.Provider value={{ user, login, register, logout, loading, theme, toggleTheme }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
