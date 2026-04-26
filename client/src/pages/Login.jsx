import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiSun, FiMoon, FiEye, FiEyeOff, FiLoader } from 'react-icons/fi';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const { login, theme, toggleTheme } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        const success = await login(email, password);
        setIsLoading(false);
        if (success) {
            navigate('/dashboard'); // We will build this next
        }
    };

    return (
        <div className="relative min-h-screen flex flex-col sm:justify-center items-center pt-6 sm:pt-0 bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
            {isLoading && (
                <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex flex-col gap-3 items-center justify-center z-50">
                    <div className="w-10 h-10 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-white text-sm font-medium">Signing you in...</p>
                </div>
            )}

            <div className="absolute top-6 right-6 z-10">
                <button onClick={toggleTheme} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors text-gray-800 dark:text-gray-200">
                    {theme === 'dark' ? <FiSun size={24} className="text-yellow-400" /> : <FiMoon size={24} />}
                </button>
            </div>

            <div className="w-full sm:max-w-md mt-6 px-10 py-12 bg-white dark:bg-gray-800 shadow-2xl dark:shadow-none border border-gray-100 dark:border-gray-700 overflow-hidden sm:rounded-3xl">
                <div className="mb-8 text-center">
                    <Link to="/" className="text-3xl font-extrabold text-blue-600 dark:text-blue-400">CareerAI</Link>
                    <h2 className="mt-4 text-2xl font-bold text-gray-900 dark:text-white">Welcome back</h2>
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">Please sign in to your account</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email Address</label>
                        <input
                            type="email"
                            required
                            className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Password</label>
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                required
                                className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all pr-12"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                            >
                                {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
                            </button>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-xl shadow-lg shadow-blue-500/30 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-all"
                    >
                        {isLoading ? (
                            <>
                                <FiLoader className="animate-spin mr-2" size={18} />
                                Signing in...
                            </>
                        ) : 'Sign in'}
                    </button>
                </form>

                <p className="mt-8 text-center text-sm text-gray-600 dark:text-gray-400">
                    Don't have an account?{' '}
                    <Link to="/register" className="font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-500 transition-colors">
                        Sign up for free
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default Login;
