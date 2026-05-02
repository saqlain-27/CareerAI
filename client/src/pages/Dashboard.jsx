import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiMessageSquare, FiFileText, FiMic, FiArrowRight } from 'react-icons/fi';

const Dashboard = () => {
    const { user } = useAuth();

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <header className="mb-10">
                <h1 className="text-3xl md:text-4xl font-extrabold mb-2">Welcome back, {user?.name.split(' ')[0]}! 👋</h1>
                <p className="text-gray-600 dark:text-gray-400 text-lg">What would you like to work on today?</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

                {/* Feature 1: AI Chat */}
                <Link to="/chat" className="group block h-full bg-white dark:bg-gray-800 rounded-3xl p-8 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-xl dark:hover:shadow-blue-900/20 hover:-translate-y-1 transition-all duration-300">
                    <div className="w-14 h-14 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-2xl flex items-center justify-center mb-6">
                        <FiMessageSquare size={28} />
                    </div>
                    <h2 className="text-2xl font-bold mb-3 flex items-center justify-between">
                        AI Chat
                        <FiArrowRight className="opacity-0 group-hover:opacity-100 -translate-x-4 group-hover:translate-x-0 transition-all duration-300 text-blue-500" />
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                        Practice coding problems, ask for system design help, or brainstorm career strategies with our highly-tuned AI assistant.
                    </p>
                </Link>

                {/* Feature 2: Resume Analyzer */}
                <Link to="/resume" className="group block h-full bg-white dark:bg-gray-800 rounded-3xl p-8 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-xl dark:hover:shadow-purple-900/20 hover:-translate-y-1 transition-all duration-300">
                    <div className="w-14 h-14 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-2xl flex items-center justify-center mb-6">
                        <FiFileText size={28} />
                    </div>
                    <h2 className="text-2xl font-bold mb-3 flex items-center justify-between">
                        Resume Analyzer
                        <FiArrowRight className="opacity-0 group-hover:opacity-100 -translate-x-4 group-hover:translate-x-0 transition-all duration-300 text-purple-500" />
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                        Upload your PDF resume against a Job Description to get an instant ATS compatibility score and strict keyword analysis.
                    </p>
                </Link>

                {/* Feature 3: Mock Interview */}
                <Link to="/interview" className="group block h-full bg-white dark:bg-gray-800 rounded-3xl p-8 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-xl dark:hover:shadow-emerald-900/20 hover:-translate-y-1 transition-all duration-300">
                    <div className="w-14 h-14 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-2xl flex items-center justify-center mb-6">
                        <FiMic size={28} />
                    </div>
                    <h2 className="text-2xl font-bold mb-3 flex items-center justify-between">
                        Mock Interviews
                        <FiArrowRight className="opacity-0 group-hover:opacity-100 -translate-x-4 group-hover:translate-x-0 transition-all duration-300 text-emerald-500" />
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                        Simulate a live 5-question technical interview. Get graded on every single answer and receive a comprehensive final review.
                    </p>
                </Link>

            </div>
        </div>
    );
};

export default Dashboard;
