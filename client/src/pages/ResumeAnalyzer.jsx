import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { FiPlus, FiMenu, FiUploadCloud, FiFileText, FiCheckCircle, FiAlertCircle, FiTrendingUp, FiTarget, FiBriefcase, FiAward, FiLayout } from 'react-icons/fi';
import { uploadResume, getResumeHistory, getResumeAnalysis } from '../services/resumeService';

const ResumeAnalyzer = () => {
    const { user } = useAuth();

    // State
    const [history, setHistory] = useState([]);
    const [activeAnalysisId, setActiveAnalysisId] = useState(null);
    const [activeAnalysis, setActiveAnalysis] = useState(null);
    
    // Upload State
    const [file, setFile] = useState(null);
    const [jobDescription, setJobDescription] = useState('');
    const [isDragging, setIsDragging] = useState(false);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [error, setError] = useState('');
    
    // UI State
    const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

    // Load History
    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const res = await getResumeHistory();
                if (res.data) setHistory(res.data);
            } catch (err) {
                console.error("Failed to load history", err);
            }
        };
        fetchHistory();
    }, []);

    // Load specific analysis
    const loadAnalysis = async (id) => {
        try {
            setError('');
            const res = await getResumeAnalysis(id);
            if (res.data) {
                setActiveAnalysis(res.data);
                setActiveAnalysisId(id);
            }
        } catch (err) {
            setError(err.message || 'Failed to load analysis');
        }
    };

    const handleNewAnalysis = () => {
        setActiveAnalysisId(null);
        setActiveAnalysis(null);
        setFile(null);
        setJobDescription('');
        setError('');
    };

    // Drag and Drop Handlers
    const onDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const onDragLeave = (e) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const onDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        const droppedFile = e.dataTransfer.files[0];
        handleFileSelection(droppedFile);
    };

    const handleFileInput = (e) => {
        const selectedFile = e.target.files[0];
        handleFileSelection(selectedFile);
    };

    const handleFileSelection = (selectedFile) => {
        setError('');
        if (!selectedFile) return;
        if (selectedFile.type !== 'application/pdf') {
            setError('Please upload a valid PDF file.');
            return;
        }
        if (selectedFile.size > 5 * 1024 * 1024) {
            setError('File size exceeds the 5MB limit.');
            return;
        }
        setFile(selectedFile);
    };

    const handleAnalyze = async () => {
        if (!file) return;
        
        setIsAnalyzing(true);
        setError('');
        
        try {
            const res = await uploadResume(file, jobDescription);
            if (res.data) {
                setActiveAnalysis(res.data);
                setActiveAnalysisId(res.data._id);
                // Refresh history
                const histRes = await getResumeHistory();
                if (histRes.data) setHistory(histRes.data);
            }
        } catch (err) {
            setError(err.message || 'Analysis failed. Please try again.');
        } finally {
            setIsAnalyzing(false);
        }
    };

    // Helper: ATS Score Color
    const getScoreColor = (score) => {
        if (score >= 80) return 'text-green-500';
        if (score >= 60) return 'text-yellow-500';
        return 'text-red-500';
    };

    const getScoreBg = (score) => {
        if (score >= 80) return 'bg-green-500';
        if (score >= 60) return 'bg-yellow-500';
        return 'bg-red-500';
    };

    // UI: Sidebar Content
    const SidebarContent = (
        <>
            <div className="p-4">
                <button
                    onClick={() => { handleNewAnalysis(); setIsMobileSidebarOpen(false); }}
                    className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-xl font-medium transition-all shadow-md shadow-blue-500/20"
                >
                    <FiPlus size={20} />
                    New Analysis
                </button>
            </div>

            <div className="flex-1 overflow-y-auto px-3 pb-4 space-y-1">
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider px-2 py-2 mb-1">Recent Resumes</p>
                {history.map(item => (
                    <button
                        key={item._id}
                        onClick={() => { loadAnalysis(item._id); setIsMobileSidebarOpen(false); }}
                        className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg text-left transition-colors truncate ${activeAnalysisId === item._id ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-medium' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700/50'}`}
                    >
                        <FiFileText size={18} className="flex-shrink-0" />
                        <div className="flex-1 overflow-hidden">
                            <span className="block truncate text-sm">{item.resumeName}</span>
                            <span className="block text-[10px] opacity-70 mt-0.5">Score: {item.atsScore}/100</span>
                        </div>
                    </button>
                ))}
            </div>
        </>
    );

    return (
        <div className="flex h-full bg-white dark:bg-gray-800">
            {/* Desktop Left Pane - History Sidebar */}
            <div className="w-64 flex-shrink-0 bg-gray-50 dark:bg-[#0b1120] border-r border-gray-200 dark:border-gray-700 flex flex-col max-md:hidden z-10">
                {SidebarContent}
            </div>

            {/* Mobile Sidebar Overlay */}
            <div className={`fixed inset-0 z-50 md:hidden transition-all duration-300 ease-in-out ${isMobileSidebarOpen ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'}`}>
                {/* Backdrop */}
                <div
                    className={`absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300 ${isMobileSidebarOpen ? 'opacity-100' : 'opacity-0'}`}
                    onClick={() => setIsMobileSidebarOpen(false)}
                ></div>

                {/* Sliding Panel */}
                <div className={`absolute top-0 left-0 w-64 max-w-[80%] bg-gray-50 dark:bg-gray-900 h-full flex flex-col shadow-2xl transition-transform duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] ${isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                    {SidebarContent}
                </div>
            </div>

            {/* Right Pane - Main Area */}
            <div className="flex-1 flex flex-col relative bg-white dark:bg-gray-800 min-w-0 overflow-hidden">
                {/* Mobile Header */}
                <div className="md:hidden flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 z-10 shadow-sm">
                    <button
                        onClick={() => setIsMobileSidebarOpen(true)}
                        className="p-2 -ml-2 rounded-lg text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                    >
                        <FiMenu size={24} />
                    </button>
                    <span className="font-semibold text-gray-900 dark:text-white">Resume Analyzer</span>
                    <div className="w-8"></div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 md:p-8 lg:p-12">
                    <div className="max-w-4xl mx-auto h-full flex flex-col">
                        
                        {/* STATE 1: UPLOAD & ANALYZE */}
                        {!activeAnalysis && !isAnalyzing && (
                            <div className="flex-1 flex flex-col justify-center animate-in fade-in duration-500">
                                <div className="text-center mb-8">
                                    <h2 className="text-3xl font-extrabold mb-3">AI Resume Analyzer</h2>
                                    <p className="text-gray-600 dark:text-gray-400 text-lg">Upload your resume and optionally paste a job description to get a harsh, realistic ATS evaluation.</p>
                                </div>

                                <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 md:p-8 shadow-xl border border-gray-200 dark:border-gray-700">
                                    {error && (
                                        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl flex items-start gap-3">
                                            <FiAlertCircle size={20} className="mt-0.5" />
                                            <p className="text-sm">{error}</p>
                                        </div>
                                    )}

                                    {/* Drag & Drop Zone */}
                                    <div 
                                        onDragOver={onDragOver}
                                        onDragLeave={onDragLeave}
                                        onDrop={onDrop}
                                        className={`border-2 border-dashed rounded-2xl p-10 text-center transition-all ${isDragging ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/10' : file ? 'border-green-500 bg-green-50 dark:bg-green-900/10' : 'border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500'}`}
                                    >
                                        <input 
                                            type="file" 
                                            accept=".pdf" 
                                            onChange={handleFileInput} 
                                            className="hidden" 
                                            id="resume-upload" 
                                        />
                                        <label htmlFor="resume-upload" className="cursor-pointer flex flex-col items-center">
                                            {file ? (
                                                <>
                                                    <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center mb-4">
                                                        <FiCheckCircle size={32} />
                                                    </div>
                                                    <p className="text-lg font-bold text-gray-900 dark:text-white mb-1">{file.name}</p>
                                                    <p className="text-sm text-gray-500 dark:text-gray-400">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                                                    <p className="text-sm text-blue-600 dark:text-blue-400 mt-4 hover:underline">Click to change file</p>
                                                </>
                                            ) : (
                                                <>
                                                    <div className="w-16 h-16 bg-blue-50 dark:bg-gray-700 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center mb-4 shadow-inner">
                                                        <FiUploadCloud size={32} />
                                                    </div>
                                                    <p className="text-lg font-bold text-gray-900 dark:text-white mb-2">Drag & Drop your resume (PDF)</p>
                                                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Max file size: 5MB</p>
                                                    <span className="bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-900/50 px-6 py-2 rounded-full font-medium shadow-sm hover:shadow-md transition-all">Browse Files</span>
                                                </>
                                            )}
                                        </label>
                                    </div>

                                    <div className="mt-8">
                                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Job Description (Optional, but highly recommended)</label>
                                        <textarea 
                                            value={jobDescription}
                                            onChange={(e) => setJobDescription(e.target.value)}
                                            placeholder="Paste the target job description here to tailor the ATS scoring..."
                                            className="w-full bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl p-4 h-32 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none placeholder-gray-400 text-sm"
                                        ></textarea>
                                    </div>

                                    <button 
                                        onClick={handleAnalyze}
                                        disabled={!file}
                                        className="w-full mt-8 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:hover:bg-blue-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-500/25 transition-all transform active:scale-[0.98] flex justify-center items-center gap-2"
                                    >
                                        <FiTarget size={20} />
                                        Analyze Resume
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* STATE 2: LOADING */}
                        {isAnalyzing && (
                            <div className="flex-1 flex flex-col items-center justify-center animate-in fade-in duration-300">
                                <div className="relative w-24 h-24 mb-8">
                                    <div className="absolute inset-0 border-4 border-gray-200 dark:border-gray-700 rounded-full"></div>
                                    <div className="absolute inset-0 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
                                    <FiFileText size={32} className="absolute inset-0 m-auto text-blue-600 dark:text-blue-400 animate-pulse" />
                                </div>
                                <h3 className="text-2xl font-bold mb-2">Simulating ATS Evaluation</h3>
                                <p className="text-gray-500 dark:text-gray-400 animate-pulse">Extracting keywords, assessing impact, formatting...</p>
                            </div>
                        )}

                        {/* STATE 3: RESULTS DASHBOARD */}
                        {activeAnalysis && !isAnalyzing && (
                            <div className="space-y-8 animate-in slide-in-from-bottom-8 duration-500 pb-10">
                                
                                {/* Header */}
                                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-200 dark:border-gray-700 shadow-sm">
                                    <div>
                                        <h2 className="text-2xl font-bold mb-1">{activeAnalysis.resumeName}</h2>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2">
                                            <FiBriefcase /> {activeAnalysis.jobDescription ? 'Tailored to Job Description' : 'General Software Engineering Evaluation'}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-4 bg-gray-50 dark:bg-gray-900/50 px-6 py-4 rounded-2xl border border-gray-100 dark:border-gray-700">
                                        <div className="text-right">
                                            <p className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">Overall ATS Score</p>
                                            <p className={`text-4xl font-extrabold ${getScoreColor(activeAnalysis.atsScore)}`}>{activeAnalysis.atsScore}<span className="text-lg text-gray-400 font-medium">/100</span></p>
                                        </div>
                                    </div>
                                </div>


                                {/* Detailed Feedback Grids */}
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    {/* Strengths */}
                                    <div className="bg-green-50 dark:bg-green-900/10 p-6 sm:p-8 rounded-3xl border border-green-100 dark:border-green-900/30">
                                        <h3 className="text-lg font-bold text-green-800 dark:text-green-400 mb-4 flex items-center gap-2">
                                            <FiCheckCircle />
                                            Strengths
                                        </h3>
                                        <ul className="space-y-3">
                                            {activeAnalysis.analysis?.strengths?.map((item, i) => (
                                                <li key={i} className="flex items-start gap-2 text-sm text-green-900 dark:text-green-200 leading-relaxed">
                                                    <span className="mt-1.5 w-1.5 h-1.5 bg-green-500 rounded-full flex-shrink-0"></span>
                                                    {item}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    {/* Weaknesses */}
                                    <div className="bg-red-50 dark:bg-red-900/10 p-6 sm:p-8 rounded-3xl border border-red-100 dark:border-red-900/30">
                                        <h3 className="text-lg font-bold text-red-800 dark:text-red-400 mb-4 flex items-center gap-2">
                                            <FiAlertCircle />
                                            Weaknesses
                                        </h3>
                                        <ul className="space-y-3">
                                            {activeAnalysis.analysis?.weaknesses?.map((item, i) => (
                                                <li key={i} className="flex items-start gap-2 text-sm text-red-900 dark:text-red-200 leading-relaxed">
                                                    <span className="mt-1.5 w-1.5 h-1.5 bg-red-500 rounded-full flex-shrink-0"></span>
                                                    {item}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>

                                {/* Keywords */}
                                <div className="bg-white dark:bg-gray-800 p-6 sm:p-8 rounded-3xl border border-gray-200 dark:border-gray-700 shadow-sm">
                                    <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                                        <FiTarget className="text-purple-500" />
                                        Keyword Analysis
                                    </h3>
                                    
                                    <div className="mb-6">
                                        <h4 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-3 uppercase tracking-wider">Matching Keywords</h4>
                                        <div className="flex flex-wrap gap-2">
                                            {activeAnalysis.analysis?.matchingKeywords?.length > 0 ? (
                                                activeAnalysis.analysis.matchingKeywords.map((kw, i) => (
                                                    <span key={i} className="px-3 py-1.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-lg text-sm font-medium border border-green-200 dark:border-green-800/50">
                                                        {kw}
                                                    </span>
                                                ))
                                            ) : (
                                                <span className="text-sm text-gray-500">No matching keywords found.</span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="pt-6 border-t border-gray-100 dark:border-gray-700">
                                        <h4 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-3 uppercase tracking-wider">Missing Keywords</h4>
                                        <div className="flex flex-wrap gap-2">
                                            {activeAnalysis.analysis?.missingKeywords?.length > 0 ? (
                                                activeAnalysis.analysis.missingKeywords.map((kw, i) => (
                                                    <span key={i} className="px-3 py-1.5 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg text-sm font-medium border border-red-200 dark:border-red-800/50">
                                                        {kw}
                                                    </span>
                                                ))
                                            ) : (
                                                <span className="text-sm text-gray-500">No missing keywords! Great job.</span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Recommendations */}
                                <div className="bg-blue-50 dark:bg-blue-900/10 p-6 sm:p-8 rounded-3xl border border-blue-100 dark:border-blue-900/30">
                                    <h3 className="text-lg font-bold text-blue-800 dark:text-blue-400 mb-4 flex items-center gap-2">
                                        <FiAward />
                                        Actionable Recommendations
                                    </h3>
                                    <ul className="space-y-4">
                                        {activeAnalysis.analysis?.recommendations?.map((item, i) => (
                                            <li key={i} className="flex items-start gap-3 text-sm text-blue-900 dark:text-blue-100 bg-white/50 dark:bg-gray-800/50 p-4 rounded-xl border border-blue-100 dark:border-blue-800/50">
                                                <div className="mt-0.5 font-bold text-blue-600 dark:text-blue-400">{i + 1}.</div>
                                                <div className="leading-relaxed">{item}</div>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ResumeAnalyzer;
