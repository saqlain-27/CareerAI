import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { FiPlus, FiMenu, FiMic, FiSend, FiUser, FiCode, FiCheckCircle, FiAlertCircle, FiAward, FiStopCircle } from 'react-icons/fi';
import ReactMarkdown from 'react-markdown';
import { startInterview, submitAnswer, endInterview, getInterviewHistory, getInterviewDetails } from '../services/interviewService';

const MockInterview = () => {
    const { user } = useAuth();
    const chatEndRef = useRef(null);

    // Core Data State
    const [history, setHistory] = useState([]);
    const [activeSession, setActiveSession] = useState(null);
    const [questions, setQuestions] = useState([]);
    
    // Setup Form State
    const [targetRole, setTargetRole] = useState('');
    const [experienceLevel, setExperienceLevel] = useState('Entry');
    const [jobDescription, setJobDescription] = useState('');
    
    // Active Interaction State
    const [currentAnswer, setCurrentAnswer] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSidebarLoading, setIsSidebarLoading] = useState(false);
    const [error, setError] = useState('');
    
    // UI State
    const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

    // Auto-scroll chat when questions update or loading starts
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [questions, isLoading]);

    // Initial History Load
    useEffect(() => {
        const fetchHistory = async () => {
            setIsSidebarLoading(true);
            try {
                const res = await getInterviewHistory();
                if (res.data) setHistory(res.data);
            } catch (err) {
                console.error("Failed to load history", err);
            } finally {
                setIsSidebarLoading(false);
            }
        };
        fetchHistory();
    }, []);

    const loadSession = async (id) => {
        try {
            setError('');
            setIsLoading(true);
            const res = await getInterviewDetails(id);
            if (res.data) {
                setActiveSession(res.data.session);
                setQuestions(res.data.questions);
            }
        } catch (err) {
            setError(err.message || 'Failed to load interview session');
        } finally {
            setIsLoading(false);
        }
    };

    const handleNewInterview = () => {
        setActiveSession(null);
        setQuestions([]);
        setTargetRole('');
        setExperienceLevel('Entry');
        setJobDescription('');
        setError('');
        setCurrentAnswer('');
    };

    const handleStart = async (e) => {
        e.preventDefault();
        if (!targetRole.trim()) {
            setError('Please provide a target role.');
            return;
        }

        setIsLoading(true);
        setError('');
        try {
            const res = await startInterview(targetRole, experienceLevel, jobDescription);
            if (res.session && res.currentQuestion) {
                setActiveSession(res.session);
                setQuestions([res.currentQuestion]);
                
                // Refresh sidebar history in background
                getInterviewHistory().then(histRes => {
                    if (histRes.data) setHistory(histRes.data);
                });
            }
        } catch (err) {
            setError(err.message || 'Failed to start interview.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmitAnswer = async (e) => {
        if (e) e.preventDefault();
        if (!currentAnswer.trim() || !activeSession) return;

        const activeQuestion = questions.find(q => !q.userAnswer);
        if (!activeQuestion) return;

        const answerText = currentAnswer;
        setCurrentAnswer(''); // Optimistic clear
        setIsLoading(true);
        setError('');

        try {
            await submitAnswer(activeSession._id, activeQuestion._id, answerText);
            
            // Reload the entire session details to get updated AI feedback + next question or summary
            const updatedDetails = await getInterviewDetails(activeSession._id);
            if (updatedDetails.data) {
                setActiveSession(updatedDetails.data.session);
                setQuestions(updatedDetails.data.questions);
                
                // If the session completed after this answer, refresh the sidebar history
                if (updatedDetails.data.session.status === 'completed') {
                    getInterviewHistory().then(histRes => {
                        if (histRes.data) setHistory(histRes.data);
                    });
                }
            }
        } catch (err) {
            setError(err.message || 'Failed to submit answer.');
            setCurrentAnswer(answerText); // restore user text on error
        } finally {
            setIsLoading(false);
        }
    };

    const handleEndEarly = async () => {
        if (!activeSession) return;
        setIsLoading(true);
        try {
            await endInterview(activeSession._id);
            const updatedDetails = await getInterviewDetails(activeSession._id);
            if (updatedDetails.data) {
                setActiveSession(updatedDetails.data.session);
                setQuestions(updatedDetails.data.questions);
                
                // Refresh sidebar history to show completion status
                getInterviewHistory().then(histRes => {
                    if (histRes.data) setHistory(histRes.data);
                });
            }
        } catch (err) {
            setError(err.message || 'Failed to end interview early.');
        } finally {
            setIsLoading(false);
        }
    };

    const getScoreColor = (score) => {
        if (score >= 80) return 'text-green-500';
        if (score >= 60) return 'text-yellow-500';
        return 'text-red-500';
    };

    const SidebarContent = (
        <>
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <button
                    onClick={() => { handleNewInterview(); setIsMobileSidebarOpen(false); }}
                    className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-xl font-medium transition-all shadow-md shadow-blue-500/20 active:scale-[0.98]"
                >
                    <FiPlus size={20} />
                    New Interview
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-1">
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider px-2 py-2 mb-1">Past Sessions</p>
                {isSidebarLoading ? (
                    <div className="flex justify-center p-4">
                        <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                ) : history.length === 0 ? (
                    <div className="text-center p-4 text-sm text-gray-500">No past interviews found.</div>
                ) : (
                    history.map(item => (
                        <button
                            key={item._id}
                            onClick={() => { loadSession(item._id); setIsMobileSidebarOpen(false); }}
                            className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left transition-colors truncate ${activeSession?._id === item._id ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-medium' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700/50'}`}
                        >
                            <FiMic size={18} className="flex-shrink-0" />
                            <div className="flex-1 overflow-hidden">
                                <span className="block truncate text-sm">{item.targetRole}</span>
                                <span className="block text-[10px] opacity-70 mt-0.5">
                                    {item.status === 'completed' ? `Score: ${item.finalScore || 0}/100` : 'In Progress'}
                                </span>
                            </div>
                        </button>
                    ))
                )}
            </div>
        </>
    );

    return (
        <div className="flex h-full bg-white dark:bg-gray-800">
            {/* Desktop Sidebar */}
            <div className="w-64 flex-shrink-0 bg-gray-50 dark:bg-[#0b1120] border-r border-gray-200 dark:border-gray-700 flex flex-col hidden md:flex z-10">
                {SidebarContent}
            </div>

            {/* Mobile Sidebar */}
            <div className={`fixed inset-0 z-50 md:hidden transition-all duration-300 ease-in-out ${isMobileSidebarOpen ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'}`}>
                <div className={`absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300 ${isMobileSidebarOpen ? 'opacity-100' : 'opacity-0'}`} onClick={() => setIsMobileSidebarOpen(false)}></div>
                <div className={`absolute top-0 left-0 w-64 max-w-[80%] bg-gray-50 dark:bg-gray-900 h-full flex flex-col shadow-2xl transition-transform duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] ${isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                    {SidebarContent}
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col relative bg-white dark:bg-gray-800 min-w-0 overflow-hidden">
                {/* Mobile Header */}
                <div className="md:hidden flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 z-10 shadow-sm">
                    <button onClick={() => setIsMobileSidebarOpen(true)} className="p-2 -ml-2 rounded-lg text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700">
                        <FiMenu size={24} />
                    </button>
                    <span className="font-semibold text-gray-900 dark:text-white">Mock Interview</span>
                    <div className="w-8"></div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 md:p-8 lg:p-12 relative flex flex-col">
                    
                    {/* Error Banner */}
                    {error && (
                        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl flex items-start gap-3 flex-shrink-0 animate-in slide-in-from-top-2">
                            <FiAlertCircle size={20} className="mt-0.5 flex-shrink-0" />
                            <p className="text-sm">{error}</p>
                        </div>
                    )}

                    {/* STATE 1: SETUP FORM */}
                    {!activeSession && !isLoading && (
                        <div className="max-w-2xl mx-auto w-full flex-1 flex flex-col justify-center animate-in fade-in duration-500">
                            <div className="text-center mb-8">
                                <h2 className="text-3xl font-extrabold mb-3">AI Mock Interview</h2>
                                <p className="text-gray-600 dark:text-gray-400 text-lg">Practice technical interviews tailored to your exact target role and experience level.</p>
                            </div>

                            <form onSubmit={handleStart} className="bg-white dark:bg-gray-800 rounded-3xl p-6 md:p-8 shadow-xl border border-gray-200 dark:border-gray-700 space-y-6">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Target Role</label>
                                    <input 
                                        type="text"
                                        required
                                        value={targetRole}
                                        onChange={(e) => setTargetRole(e.target.value)}
                                        placeholder="e.g. Frontend Developer, Data Scientist..."
                                        className="w-full bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl p-4 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Experience Level</label>
                                    <select 
                                        value={experienceLevel}
                                        onChange={(e) => setExperienceLevel(e.target.value)}
                                        className="w-full bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl p-4 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                    >
                                        <option value="Entry">Entry Level (0-2 years)</option>
                                        <option value="Mid">Mid Level (2-5 years)</option>
                                        <option value="Senior">Senior Level (5+ years)</option>
                                        <option value="Lead">Lead / Staff</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Job Description (Optional)</label>
                                    <textarea 
                                        value={jobDescription}
                                        onChange={(e) => setJobDescription(e.target.value)}
                                        placeholder="Paste the job description here to generate highly specific questions..."
                                        className="w-full bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl p-4 h-32 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none placeholder-gray-400 text-sm transition-all"
                                    ></textarea>
                                </div>

                                <button 
                                    type="submit"
                                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-500/25 transition-all transform active:scale-[0.98] flex justify-center items-center gap-2"
                                >
                                    <FiMic size={20} />
                                    Start Interview
                                </button>
                            </form>
                        </div>
                    )}

                    {/* FULL PAGE LOADING STATE (Used when initializing a session from history) */}
                    {!activeSession && isLoading && (
                        <div className="flex-1 flex flex-col items-center justify-center">
                            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
                            <p className="text-gray-500 font-medium animate-pulse">Loading session...</p>
                        </div>
                    )}

                    {/* STATE 2: ACTIVE INTERVIEW FEED */}
                    {activeSession && activeSession.status === 'in-progress' && (
                        <div className="max-w-4xl mx-auto w-full flex-1 flex flex-col min-h-0 animate-in fade-in duration-500">
                            {/* Header Info */}
                            <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
                                <div>
                                    <h3 className="text-xl font-bold">{activeSession.targetRole}</h3>
                                    <p className="text-sm text-gray-500">{activeSession.experienceLevel} Level</p>
                                </div>
                                <button 
                                    onClick={handleEndEarly}
                                    disabled={isLoading}
                                    className="text-sm flex items-center gap-2 text-red-500 hover:text-red-600 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
                                >
                                    <FiStopCircle />
                                    End Early
                                </button>
                            </div>

                            {/* Scrolling Chat Feed */}
                            <div className="flex-1 overflow-y-auto space-y-6 pb-4 min-h-0 pr-2">
                                {questions.map((q, idx) => (
                                    <div key={q._id} className="space-y-6">
                                        {/* AI Question */}
                                        <div className="flex items-start gap-4">
                                            <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center flex-shrink-0">
                                                <FiCode className="text-blue-600 dark:text-blue-400" size={20} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-2xl rounded-tl-none p-5 shadow-sm border border-gray-100 dark:border-gray-700/50">
                                                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Question {q.questionOrder} of 5</p>
                                                    <div className="prose dark:prose-invert max-w-none text-[15px] leading-relaxed">
                                                        <ReactMarkdown>{q.questionText}</ReactMarkdown>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* User Answer */}
                                        {q.userAnswer && (
                                            <div className="flex items-start gap-4 flex-row-reverse">
                                                <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center flex-shrink-0">
                                                    <FiUser className="text-indigo-600 dark:text-indigo-400" size={20} />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="bg-blue-600 text-white rounded-2xl rounded-tr-none p-5 shadow-sm">
                                                        <div className="prose prose-invert max-w-none text-[15px] leading-relaxed whitespace-pre-wrap">
                                                            {q.userAnswer}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* AI Evaluation Feedback */}
                                        {q.aiFeedback && (
                                            <div className="flex items-start gap-4">
                                                <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 opacity-0"></div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="bg-green-50 dark:bg-green-900/10 rounded-2xl p-5 border border-green-100 dark:border-green-900/30">
                                                        <div className="flex justify-between items-center mb-3">
                                                            <p className="text-xs font-semibold text-green-700 dark:text-green-400 uppercase tracking-wider">Evaluation Feedback</p>
                                                            <span className="text-xs font-bold bg-white dark:bg-gray-800 text-green-700 dark:text-green-400 px-2 py-1 rounded-md border border-green-200 dark:border-green-900/50">Score: {q.score}/10</span>
                                                        </div>
                                                        <div className="prose dark:prose-invert prose-p:text-green-900 dark:prose-p:text-green-100 max-w-none text-[14px] leading-relaxed">
                                                            <ReactMarkdown>{q.aiFeedback}</ReactMarkdown>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}

                                {/* Inline Loading Indicator (Waiting for AI) */}
                                {isLoading && (
                                    <div className="flex items-start gap-4 animate-in fade-in">
                                        <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center flex-shrink-0">
                                            <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                                        </div>
                                        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-2xl rounded-tl-none p-4 border border-gray-100 dark:border-gray-700/50">
                                            <div className="flex gap-1.5 items-center h-5 px-1">
                                                <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                                <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                                <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '300ms' }}></div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                                <div ref={chatEndRef} className="h-4" />
                            </div>

                            {/* Answer Input Area */}
                            {questions.length > 0 && !questions[questions.length - 1].userAnswer && (
                                <div className="mt-2 flex-shrink-0 relative">
                                    <textarea
                                        value={currentAnswer}
                                        onChange={(e) => setCurrentAnswer(e.target.value)}
                                        placeholder="Type your answer here..."
                                        disabled={isLoading}
                                        className="w-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-2xl pl-5 pr-14 py-4 min-h-[120px] max-h-[300px] shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none overflow-y-auto disabled:opacity-50 transition-all"
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' && !e.shiftKey) {
                                                e.preventDefault();
                                                handleSubmitAnswer(e);
                                            }
                                        }}
                                    />
                                    <button
                                        onClick={handleSubmitAnswer}
                                        disabled={!currentAnswer.trim() || isLoading}
                                        className="absolute right-3 bottom-3 p-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:hover:bg-blue-600 text-white rounded-xl transition-all shadow-md shadow-blue-500/20 active:scale-95"
                                    >
                                        <FiSend size={18} className="translate-y-px translate-x-[0.5px]" />
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    {/* STATE 3: COMPLETED RESULTS DASHBOARD */}
                    {activeSession && activeSession.status === 'completed' && !isLoading && (
                        <div className="max-w-4xl mx-auto w-full animate-in slide-in-from-bottom-8 duration-500 pb-10">
                            
                            {/* Top Summary Banner */}
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-200 dark:border-gray-700 shadow-sm mb-8">
                                <div>
                                    <h2 className="text-2xl font-bold mb-1">Interview Completed</h2>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        Target Role: <span className="font-medium text-gray-700 dark:text-gray-300">{activeSession.targetRole}</span> ({activeSession.experienceLevel})
                                    </p>
                                </div>
                                <div className="flex items-center gap-4 bg-gray-50 dark:bg-gray-900/50 px-6 py-4 rounded-2xl border border-gray-100 dark:border-gray-700">
                                    <div className="text-right">
                                        <p className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">Final Score</p>
                                        <p className={`text-4xl font-extrabold ${getScoreColor(activeSession.finalScore || 0)}`}>{activeSession.finalScore || 0}<span className="text-lg text-gray-400 font-medium">/100</span></p>
                                    </div>
                                </div>
                            </div>

                            {/* Detailed Final Feedback */}
                            {activeSession.finalFeedback && (
                                <div className="space-y-6">
                                    {/* Overall Analysis */}
                                    <div className="bg-blue-50 dark:bg-blue-900/10 p-6 sm:p-8 rounded-3xl border border-blue-100 dark:border-blue-900/30">
                                        <h3 className="text-lg font-bold text-blue-800 dark:text-blue-400 mb-4 flex items-center gap-2">
                                            <FiAward />
                                            Overall Performance Summary
                                        </h3>
                                        <p className="text-blue-900 dark:text-blue-100 leading-relaxed text-[15px]">
                                            {activeSession.finalFeedback.overallAnalysis || activeSession.finalFeedback}
                                        </p>
                                    </div>

                                    {/* Strengths & Weaknesses Grids */}
                                    {activeSession.finalFeedback.strengths && (
                                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                            <div className="bg-green-50 dark:bg-green-900/10 p-6 sm:p-8 rounded-3xl border border-green-100 dark:border-green-900/30">
                                                <h3 className="text-lg font-bold text-green-800 dark:text-green-400 mb-4 flex items-center gap-2">
                                                    <FiCheckCircle /> Strengths
                                                </h3>
                                                <ul className="space-y-3">
                                                    {activeSession.finalFeedback.strengths.map((item, i) => (
                                                        <li key={i} className="flex items-start gap-2 text-sm text-green-900 dark:text-green-200 leading-relaxed">
                                                            <span className="mt-1.5 w-1.5 h-1.5 bg-green-500 rounded-full flex-shrink-0"></span>
                                                            {item}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>

                                            <div className="bg-red-50 dark:bg-red-900/10 p-6 sm:p-8 rounded-3xl border border-red-100 dark:border-red-900/30">
                                                <h3 className="text-lg font-bold text-red-800 dark:text-red-400 mb-4 flex items-center gap-2">
                                                    <FiAlertCircle /> Areas for Improvement
                                                </h3>
                                                <ul className="space-y-3">
                                                    {activeSession.finalFeedback.weaknesses?.map((item, i) => (
                                                        <li key={i} className="flex items-start gap-2 text-sm text-red-900 dark:text-red-200 leading-relaxed">
                                                            <span className="mt-1.5 w-1.5 h-1.5 bg-red-500 rounded-full flex-shrink-0"></span>
                                                            {item}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Full Q&A Review Log */}
                            <div className="mt-12">
                                <h3 className="text-xl font-bold mb-6">Question & Answer Transcript</h3>
                                <div className="space-y-6">
                                    {questions.map((q) => (
                                        <div key={q._id} className="bg-gray-50 dark:bg-gray-900/50 rounded-2xl p-6 md:p-8 border border-gray-200 dark:border-gray-700 transition-all hover:shadow-md">
                                            <div className="flex justify-between items-start mb-5">
                                                <span className="text-sm font-bold text-gray-500 uppercase tracking-wider">Question {q.questionOrder}</span>
                                                {q.score && <span className="text-sm font-bold bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 px-3 py-1 rounded-full border border-gray-200 dark:border-gray-700 shadow-sm">Score: {q.score}/10</span>}
                                            </div>
                                            
                                            <div className="prose dark:prose-invert max-w-none text-[15px] mb-6">
                                                <ReactMarkdown>{q.questionText}</ReactMarkdown>
                                            </div>
                                            
                                            <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700 mb-5 shadow-sm">
                                                <p className="text-xs font-bold text-gray-400 mb-3 uppercase tracking-wider">Your Answer</p>
                                                <p className="text-[14px] text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">{q.userAnswer || <span className="italic text-gray-400">No answer provided.</span>}</p>
                                            </div>
                                            
                                            {q.aiFeedback && (
                                                <div className="bg-green-50 dark:bg-green-900/10 rounded-xl p-5 border border-green-100 dark:border-green-900/30">
                                                    <p className="text-xs font-bold text-green-600 dark:text-green-500 mb-3 uppercase tracking-wider">AI Feedback</p>
                                                    <div className="prose dark:prose-invert prose-p:text-green-900 dark:prose-p:text-green-100 max-w-none text-[14px] leading-relaxed">
                                                        <ReactMarkdown>{q.aiFeedback}</ReactMarkdown>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>

                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MockInterview;
