import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { FiSend, FiPlus, FiMessageSquare, FiMenu, FiCode, FiMic } from 'react-icons/fi';
import { startNewChat, getAllChats, getChatHistory, sendMessage } from '../services/chatService';
import Markdown from 'react-markdown';

const Chat = () => {
    const { user } = useAuth();

    // State
    const [chats, setChats] = useState([]);
    const [activeChat, setActiveChat] = useState(null);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [selectedMode, setSelectedMode] = useState('normal');
    const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

    const modes = [
        { id: 'normal', label: 'Career Coach', icon: <FiMessageSquare size={18} /> },
        { id: 'coding', label: 'Coding Assistant', icon: <FiCode size={18} /> },
        { id: 'interview', label: 'Mock Interview', icon: <FiMic size={18} /> }
    ];

    const messagesEndRef = useRef(null);

    // Initial Load - Fetch all history
    useEffect(() => {
        loadChats();
    }, []);

    // Auto-Scroll to bottom whenever messages or typing state changes
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isTyping]);

    const loadChats = async () => {
        try {
            const history = await getAllChats();
            // Filter out the test chats from the UI
            setChats(history.filter(chat => !chat.title.toLowerCase().includes('test')));
        } catch (error) {
            console.error('Failed to load chats');
        }
    };

    const handleNewChat = () => {
        // Just reset the UI. Chat will be created on first message.
        setActiveChat(null);
        setMessages([]);
        setSelectedMode('normal');
    };

    const loadChatHistory = async (chatId) => {
        try {
            setActiveChat(chatId);
            const { messages } = await getChatHistory(chatId);
            setMessages(messages);
        } catch (error) {
            console.error('Failed to load chat history');
        }
    };

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim() || isTyping) return;

        // If no active chat, create one automatically
        let currentChatId = activeChat;
        if (!currentChatId) {
            try {
                // Generate a clean title from the first few words of the message
                const words = input.trim().split(' ');
                const title = words.length <= 5 ? input.trim() : words.slice(0, 5).join(' ') + '...';

                const newChat = await startNewChat(title, selectedMode);
                setChats([newChat, ...chats]);
                currentChatId = newChat._id;
                setActiveChat(currentChatId);
            } catch (error) {
                console.error('Failed to auto-create chat');
                return;
            }
        }

        const userText = input;
        setInput('');

        // Optimistic UI Update
        const optimisticMsg = { role: 'user', content: userText, _id: Date.now() };
        setMessages(prev => [...prev, optimisticMsg]);
        setIsTyping(true);

        try {
            const response = await sendMessage(currentChatId, userText);
            // Replace optimistic message and add AI response
            setMessages(prev => [
                ...prev.filter(m => m._id !== optimisticMsg._id),
                response.userMessage,
                response.aiMessage
            ]);

            // If it was a new chat, we might want to refresh the history list to get updated titles, but we'll skip for performance unless needed.
        } catch (error) {
            console.error('Failed to send message');
            // Remove optimistic message on failure
            setMessages(prev => prev.filter(m => m._id !== optimisticMsg._id));
        } finally {
            setIsTyping(false);
        }
    };

    const SidebarContent = (
        <>
            <div className="p-4">
                <button
                    onClick={() => { handleNewChat(); setIsMobileSidebarOpen(false); }}
                    className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-xl font-medium transition-all shadow-md shadow-blue-500/20"
                >
                    <FiPlus size={20} />
                    New Chat
                </button>
            </div>

            <div className="flex-1 overflow-y-auto px-3 pb-4 space-y-1">
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider px-2 py-2 mb-1">Recent Chats</p>
                {chats.map(chat => (
                    <button
                        key={chat._id}
                        onClick={() => { loadChatHistory(chat._id); setIsMobileSidebarOpen(false); }}
                        className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg text-left transition-colors truncate ${activeChat === chat._id ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-medium' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700/50'}`}
                    >
                        <FiMessageSquare size={18} className="flex-shrink-0" />
                        <span className="truncate text-sm">{chat.title}</span>
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

            {/* Right Pane - Main Chat Area */}
            <div className="flex-1 flex flex-col relative bg-white dark:bg-gray-800 min-w-0 overflow-hidden">
                {/* Mobile Header */}
                <div className="md:hidden flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 z-10 shadow-sm">
                    <button
                        onClick={() => setIsMobileSidebarOpen(true)}
                        className="p-2 -ml-2 rounded-lg text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                    >
                        <FiMenu size={24} />
                    </button>
                    <span className="font-semibold text-gray-900 dark:text-white">CareerAI Chat</span>
                    <div className="w-8"></div>
                </div>

                {/* Messages Container */}
                <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
                    {messages.length === 0 && !isTyping ? (
                        <div className="h-full flex flex-col items-center justify-center text-center px-4">
                            <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center mb-6">
                                <FiMessageSquare size={32} />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">How can I help your career today?</h2>
                            <p className="text-gray-500 dark:text-gray-400 max-w-md mb-8">Select an AI mode and start your conversation below.</p>

                            <div className="flex flex-wrap gap-3 justify-center">
                                {modes.map(m => (
                                    <button
                                        key={m.id}
                                        onClick={() => setSelectedMode(m.id)}
                                        className={`px-5 py-3 rounded-xl border flex items-center gap-3 transition-all ${selectedMode === m.id
                                            ? 'bg-blue-50 border-blue-500 text-blue-700 dark:bg-blue-900/40 dark:border-blue-400 dark:text-blue-300 shadow-sm'
                                            : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700'
                                            }`}
                                    >
                                        {m.icon}
                                        <span className="font-medium">{m.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    ) : (
                        messages.map((msg, index) => (
                            <div key={msg._id || index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`flex gap-4 max-w-[85%] sm:max-w-[75%] min-w-0 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>

                                    {/* Avatar */}
                                    <div className="flex-shrink-0">
                                        {msg.role === 'user' ? (
                                            <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold shadow-sm">
                                                {user?.name?.charAt(0).toUpperCase() || 'U'}
                                            </div>
                                        ) : (
                                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white flex items-center justify-center text-xs font-bold shadow-sm">
                                                AI
                                            </div>
                                        )}
                                    </div>

                                    {/* Message Bubble */}
                                    <div className={`px-5 py-3.5 rounded-2xl min-w-0 w-full ${msg.role === 'user' ? 'bg-blue-600 text-white rounded-tr-sm shadow-md' : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-tl-sm shadow-sm'}`}>
                                        <div className="[&>p]:mb-3 [&>p:last-child]:mb-0 [&_pre]:overflow-x-auto [&_pre]:bg-black/5 dark:[&_pre]:bg-black/30 [&_pre]:p-3 [&_pre]:rounded-lg [&_pre]:my-3 [&_code]:bg-black/5 dark:[&_code]:bg-white/10 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:font-mono [&_code]:text-sm [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:mb-3 [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:mb-3 [&_li]:mb-1 [&_h1]:text-xl [&_h1]:font-bold [&_h1]:mb-2 [&_h2]:text-lg [&_h2]:font-bold [&_h2]:mb-2 [&_h3]:text-base [&_h3]:font-bold [&_h3]:mb-2 [&_strong]:font-semibold break-words">
                                            <Markdown>{msg.content}</Markdown>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}

                    {/* Typing Indicator */}
                    {isTyping && (
                        <div className="flex justify-start">
                            <div className="flex gap-4 max-w-[85%] sm:max-w-[75%]">
                                <div className="flex-shrink-0">
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white flex items-center justify-center text-xs font-bold">
                                        AI
                                    </div>
                                </div>
                                <div className="px-5 py-3.5 rounded-2xl bg-gray-100 dark:bg-gray-700 rounded-tl-sm flex items-center">
                                    <div className="animate-pulse text-gray-400 font-medium">
                                        AI is thinking...
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Auto-scroll anchor */}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="p-4 sm:p-6 bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700/50">
                    <form onSubmit={handleSend} className="relative max-w-4xl mx-auto flex items-end gap-2">
                        <textarea
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSend(e);
                                }
                            }}
                            placeholder="Type your message here..."
                            className="w-full bg-gray-100 dark:bg-gray-900 border border-transparent focus:border-blue-500 dark:focus:border-blue-500 rounded-2xl py-3.5 pl-5 pr-14 outline-none resize-none min-h-[56px] max-h-[150px] text-gray-900 dark:text-gray-100 transition-all shadow-inner"
                            rows="1"
                            disabled={isTyping}
                        />
                        <button
                            type="submit"
                            disabled={!input.trim() || isTyping}
                            className="absolute right-2 bottom-2 p-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 disabled:hover:bg-blue-600 transition-colors shadow-md"
                        >
                            <FiSend size={20} />
                        </button>
                    </form>
                    <p className="text-center text-xs text-gray-400 dark:text-gray-500 mt-3">
                        CareerAI can make mistakes. Verify important information.
                    </p>
                </div>
            </div>

        </div>
    );
};

export default Chat;