import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiSun, FiMoon } from 'react-icons/fi';

const Landing = () => {
  const { theme, toggleTheme } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-300">
      <nav className="flex justify-between items-center p-6 max-w-7xl mx-auto">
        <h1 className="text-3xl font-extrabold text-blue-600 dark:text-blue-400">CareerAI</h1>
        <div className="flex items-center gap-4">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors"
          >
            {theme === 'dark' ? <FiSun size={24} className="text-yellow-400" /> : <FiMoon size={24} className="text-gray-600" />}
          </button>
          <Link to="/login" className="font-medium hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Log In</Link>
          <Link to="/register" className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg font-medium transition-colors shadow-lg shadow-blue-500/30">
            Get Started
          </Link>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-20 text-center flex flex-col items-center justify-center min-h-[70vh]">
        <h2 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 leading-tight">
          Supercharge Your Career <br className="hidden md:block" /> with <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">AI Precision</span>.
        </h2>
        <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-400 mb-10 max-w-3xl">
          Instantly analyze your resume against industry standards, practice with dynamic mock interviews, and ask our expert AI career assistant anything.
        </p>

        <div className="flex flex-col sm:flex-row gap-4">
          <Link to="/register" className="bg-blue-600 hover:bg-blue-700 text-white text-lg px-8 py-4 rounded-xl font-bold transition-all shadow-xl shadow-blue-500/30 hover:-translate-y-1">
            Start For Free
          </Link>
        </div>

        <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8 w-full text-left">
          <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl shadow-gray-200/50 dark:shadow-none border border-gray-100 dark:border-gray-700">
            <div className="h-12 w-12 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl flex items-center justify-center text-2xl mb-6">💬</div>
            <h3 className="text-2xl font-bold mb-3">AI Assistant</h3>
            <p className="text-gray-600 dark:text-gray-400">Ask coding questions, get system design help, or do a conversational prep run with our highly-tuned AI.</p>
          </div>

          <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl shadow-gray-200/50 dark:shadow-none border border-gray-100 dark:border-gray-700">
            <div className="h-12 w-12 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-xl flex items-center justify-center text-2xl mb-6">📄</div>
            <h3 className="text-2xl font-bold mb-3">Resume Analyzer</h3>
            <p className="text-gray-600 dark:text-gray-400">Drop your PDF resume and a job description to get a brutal, ATS-style analysis and keyword grading.</p>
          </div>

          <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl shadow-gray-200/50 dark:shadow-none border border-gray-100 dark:border-gray-700">
            <div className="h-12 w-12 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-xl flex items-center justify-center text-2xl mb-6">🎤</div>
            <h3 className="text-2xl font-bold mb-3">Mock Interviews</h3>
            <p className="text-gray-600 dark:text-gray-400">Simulate a strict 5-question technical interview. Get graded on every answer and receive a final performance summary.</p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Landing;
