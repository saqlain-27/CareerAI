import { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiSun, FiMoon, FiLogOut, FiHome, FiMessageSquare, FiFileText, FiMic, FiMenu, FiX } from 'react-icons/fi';

const DashboardLayout = () => {
    const { user, logout, theme, toggleTheme } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const navItems = [
        { name: 'Dashboard', path: '/dashboard', icon: <FiHome size={22} /> },
        { name: 'AI Chat', path: '/chat', icon: <FiMessageSquare size={22} /> },
        { name: 'Resume Analyzer', path: '/resume', icon: <FiFileText size={22} /> },
        { name: 'Mock Interviews', path: '/interview', icon: <FiMic size={22} /> },
    ];

    return (
        <div className="flex h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-300 overflow-hidden">
            {/* Mobile Backdrop */}
            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 md:hidden"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`fixed inset-y-0 left-0 w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col z-40 transform transition-transform duration-300 md:static md:translate-x-0 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="h-16 flex items-center px-6 border-b border-gray-200 dark:border-gray-700 justify-between">
                    <h1 className="text-2xl font-extrabold text-blue-600 dark:text-blue-400 tracking-tight">CareerAI</h1>
                    <button className="md:hidden p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200" onClick={() => setIsMobileMenuOpen(false)}>
                        <FiX size={24} />
                    </button>
                </div>

                <nav className="flex-1 py-6 px-4 space-y-2 overflow-y-auto">
                    {navItems.map((item) => {
                        const isActive = location.pathname.startsWith(item.path);
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                onClick={() => setIsMobileMenuOpen(false)}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive
                                    ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-medium'
                                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700/50 hover:text-gray-900 dark:hover:text-gray-200'
                                    }`}
                            >
                                {item.icon}
                                {item.name}
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all"
                    >
                        <FiLogOut size={22} />
                        Logout
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col h-full overflow-hidden">
                {/* Topbar */}
                <header className="h-16 flex-shrink-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-6 z-10 relative">
                    <div className="flex items-center gap-4 md:hidden">
                        <button
                            onClick={() => setIsMobileMenuOpen(true)}
                            className="p-2 -ml-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                        >
                            <FiMenu size={24} />
                        </button>
                        <h1 className="text-xl font-bold text-blue-600 dark:text-blue-400 tracking-tight">CareerAI</h1>
                    </div>

                    <div className="hidden md:flex items-center text-sm font-medium text-gray-500 dark:text-gray-400">
                        {/* Breadcrumbs or greeting could go here */}
                    </div>

                    <div className="flex items-center gap-4">
                        <span className="text-sm font-medium hidden sm:block">
                            {user?.name}
                        </span>
                        <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm">
                            {user?.name?.charAt(0).toUpperCase()}
                        </div>
                        <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-2"></div>
                        <button onClick={toggleTheme} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                            {theme === 'dark' ? <FiSun size={20} className="text-yellow-400" /> : <FiMoon size={20} className="text-gray-600" />}
                        </button>
                    </div>
                </header>

                {/* Scrollable Page Content */}
                {/* Scrollable Page Content */}
                <main className={`flex-1 overflow-y-auto relative ${(location.pathname.startsWith('/chat') || location.pathname.startsWith('/resume') || location.pathname.startsWith('/interview')) ? 'p-0 bg-gray-100 dark:bg-[#0b1121]' : 'p-6 md:p-10'}`}>
                    <div className={`${(location.pathname.startsWith('/chat') || location.pathname.startsWith('/resume') || location.pathname.startsWith('/interview')) ? 'h-full' : 'max-w-6xl mx-auto'}`}>
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout;
