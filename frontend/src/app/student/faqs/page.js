"use client";

import React, { useEffect, useState, useRef } from 'react';
import Navigation from '../navigation';
import ReactMarkdown from "react-markdown";
import Permission from '../permission';

export default function FAQS() {
    const [prompt, setPrompt] = useState("");
    const [messages, setMessages] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [conversationSession, setConversationSession] = useState(null);
    const [showPermissionModal, setShowPermissionModal] = useState(false);
    const [authIntent, setAuthIntent] = useState(null);
    const [faqsByDepartment, setFaqsByDepartment] = useState([]);
    const [faqsLoading, setFaqsLoading] = useState(true);

    const messagesEndRef = useRef(null);

    // Initialize session on mount
    useEffect(() => {
        const initializeSession = () => {
            const storedSessionId = localStorage.getItem('tlc_chatmate_session_id');
            
            let sessionId;
            if (storedSessionId) {
                sessionId = storedSessionId;
                console.log('✓ Resuming existing session:', sessionId);
            } else {
                sessionId = 'session_' + crypto.randomUUID();
                localStorage.setItem('tlc_chatmate_session_id', sessionId);
                console.log('✓ Created new session:', sessionId);
            }
            
            setConversationSession(sessionId);
        };

        initializeSession();
    }, []);

    // Fetch FAQs organized by department
    useEffect(() => {
        const fetchFaqs = async () => {
            try {
                const response = await fetch("/api/admin/faqs");
                if (response.ok) {
                    const data = await response.json();
                    if (data.success && data.data) {
                        setFaqsByDepartment(data.data);
                    }
                }
            } catch (error) {
                console.error("Error fetching FAQs:", error);
            } finally {
                setFaqsLoading(false);
            }
        };
        
        fetchFaqs();
        
        const checkLoginStatus = () => {
            const isLoggedIn = localStorage.getItem('isLoggedIn');
            if (isLoggedIn) {
                console.log('✓ User is logged in');
            }
        };
        checkLoginStatus();
    }, []);

    // Auto-scroll to latest message
    useEffect(() => {
        const timer = setTimeout(() => {
            if (messagesEndRef.current) {
                messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
            }
        }, 100);
        
        return () => clearTimeout(timer);
    }, [messages, isLoading]);

    const handleInputChange = (e) => {
        const value = e.target.value;
        if (value.length <= 100) {
            setPrompt(value);
        }
    };

    const handlePaste = (e) => {
        e.preventDefault();
    };

    const UserMessage = ({ message }) => {
        return (
            <div className="flex justify-end mb-6">
                <div className="max-w-[85%] sm:max-w-[75%] bg-gradient-to-br from-[#205781] to-[#2a6ba0] text-white rounded-2xl rounded-br-md px-5 py-3.5 shadow-lg">
                    <div className="text-sm leading-relaxed">{message}</div>
                </div>
            </div>
        );
    };

    const AIMessage = ({ message }) => {
        return (
            <div className="flex justify-start mb-6">
                <div className="max-w-[85%] sm:max-w-[75%] bg-white/80 backdrop-blur-sm rounded-2xl rounded-bl-md px-5 py-3.5 shadow-md border border-gray-100">
                    <div className="text-sm text-gray-600 prose prose-sm max-w-none leading-relaxed">
                        <ReactMarkdown components={{ 
                            p: ({ node, ...props }) => <p className="mb-2 last:mb-0" {...props} />, 
                            ul: ({ node, ...props }) => <ul className="list-disc pl-5 mb-2 space-y-1" {...props} />, 
                            ol: ({ node, ...props }) => <ol className="list-decimal pl-5 mb-2 space-y-1" {...props} />, 
                            li: ({ node, ...props }) => <li className="mb-1" {...props} />, 
                            strong: ({ node, ...props }) => <strong className="font-semibold text-gray-800" {...props} />, 
                            h1: ({ node, ...props }) => <h1 className="text-lg font-bold mb-2" {...props} />, 
                            h2: ({ node, ...props }) => <h2 className="text-base font-bold mb-2" {...props} />, 
                            h3: ({ node, ...props }) => <h3 className="text-sm font-bold mb-1" {...props} /> 
                        }}>
                            {message}
                        </ReactMarkdown>
                    </div>
                </div>
            </div>
        );
    };

    const handlePreTypeQuestion = (question) => {
        if (isLoading || !conversationSession) return;
        
        const truncatedQuestion = question.length > 100 ? question.substring(0, 97) + '...' : question;
        handleSubmitQuestion(truncatedQuestion);
    };

    const handleSubmitQuestion = async (questionText = null) => {
        if (!conversationSession) {
            console.error("✗ Session not initialized");
            return;
        }

        const userMessage = questionText || prompt.trim();
        if (userMessage === "" || isLoading) return;

        const newUserMessage = { type: 'user', content: userMessage, id: Date.now() };
        setMessages(prev => [...prev, newUserMessage]);

        if (!questionText) {
            setPrompt("");
        }

        setIsLoading(true);

        try {
            console.log(`📤 Sending to session: ${conversationSession}`);
            
            const response = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    prompt: userMessage,
                    conversationSession: conversationSession,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to get response');
            }

            if (data.requires_auth) {
                setAuthIntent(data.intent);
                setShowPermissionModal(true);
                setMessages(prev => prev.filter(msg => msg.id !== newUserMessage.id));
            } else {
                const aiResponse = data.response || "I don't have enough information to answer that question. Please visit The Lewis College for more details.";

                const newAIMessage = { type: 'ai', content: aiResponse, id: Date.now() + 1 };
                setMessages(prev => [...prev, newAIMessage]);
            }

        } catch (error) {
            console.error("✗ Error:", error);
            const errorMessage = {
                type: 'ai',
                content: "Sorry, there was an error processing your request. Please try again.",
                id: Date.now() + 1,
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    const submit = async (e) => {
        e.preventDefault();
        handleSubmitQuestion();
    };

    const handlePermissionClose = () => {
        setShowPermissionModal(false);
        setAuthIntent(null);
    };

    const handlePermissionContinue = () => {
        setShowPermissionModal(false);
        window.location.href = '/student/login';
    };

    if (!conversationSession) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-2 border-[#205781] border-t-transparent mx-auto mb-4"></div>
                    <p className="text-gray-600">Initializing chat session...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white">
    <Navigation />

    {showPermissionModal && (
        <Permission onClose={handlePermissionClose} onContinue={handlePermissionContinue} intent={authIntent} />
    )}

    <main className="transition-all duration-300 ease-in-out pt-[90px] pb-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center my-8 sm:my-12 space-y-6 sm:space-y-8">
                <div className="space-y-3 sm:space-y-4">
                    <h2 className="text-2xl sm:text-3xl lg:text-4xl font-medium text-gray-600 leading-tight px-2">
                        Good day! How may I assist you today?
                    </h2>
                    <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto px-4 leading-relaxed">
                        You can select from the options below or feel free to type your questions.
                    </p>
                </div>
            </div>

            {/* FAQ Cards organized by Department */}
            <div className="mb-12">
                {faqsLoading ? (
                    <div className="flex justify-center py-12">
                        <div className="animate-spin rounded-full h-10 w-10 border-2 border-[#205781] border-t-transparent"></div>
                    </div>
                ) : faqsByDepartment && faqsByDepartment.length > 0 ? (
                    <div className="overflow-x-auto lg:overflow-visible pb-4">
                        <div className="flex gap-6 min-w-max lg:flex-wrap lg:justify-center lg:min-w-0 px-4 sm:px-6">
                            {faqsByDepartment.map((dept) => (
                                <div 
                                    key={dept.department_id} 
                                    className="border border-gray-200 rounded-xl p-5 w-72 lg:w-80 xl:w-72 flex-shrink-0 bg-white hover:border-[#205781]/20 transition-all duration-200 shadow-sm hover:shadow-md"
                                >
                                    <h2 className="font-semibold text-center mb-4 text-gray-800 text-sm sm:text-base line-clamp-2">
                                        {dept.department_name || "General"}
                                    </h2>
                                    <div className="space-y-2.5 max-h-80 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                                        {dept.faqs && dept.faqs.length > 0 ? (
                                            dept.faqs.map((faq) => (
                                                <button
                                                    key={faq.faq_id}
                                                    onClick={() => handlePreTypeQuestion(faq.full_question)}
                                                    disabled={isLoading}
                                                    className="w-full bg-white hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed text-gray-600 text-xs sm:text-sm px-4 py-2.5 rounded-lg transition-all duration-200 text-left line-clamp-2 font-medium shadow-sm hover:shadow-md border border-gray-200"
                                                    title={faq.full_question}
                                                >
                                                    {faq.question}
                                                </button>
                                            ))
                                        ) : (
                                            <p className="text-sm text-gray-400 text-center py-4">No FAQs available</p>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-12 text-gray-500">
                        <p className="text-lg">No FAQs available at the moment.</p>
                    </div>
                )}
            </div>

            {/* Chat Messages */}
            <div className="space-y-4 max-w-3xl mx-auto px-4 sm:px-6">
                {messages.map((message) => {
                    if (message.type === 'user') {
                        return <UserMessage key={message.id} message={message.content} />;
                    }
                    if (message.type === 'ai') {
                        return <AIMessage key={message.id} message={message.content} />;
                    }
                    return null;
                })}
                {isLoading && (
                    <div className="flex justify-start mb-6">
                        <div className="max-w-[85%] sm:max-w-[75%] bg-white/90 backdrop-blur-sm rounded-2xl rounded-bl-md px-5 py-3.5 shadow-sm border border-gray-100">
                            <div className="flex items-center space-x-2">
                                <div className="animate-spin rounded-full h-4 w-4 border-2 border-[#205781] border-t-transparent"></div>
                            </div>
                        </div>
                    </div>
                )}
                
                <div ref={messagesEndRef} />
            </div>
        </div>
    </main>

    {/* Chat Input */}
    <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-gray-200 shadow-lg z-30">
        <div className="transition-all duration-300 ease-in-out">
            <div className="max-w-5xl mx-auto p-3 sm:p-4 lg:p-5">
                <form onSubmit={submit} className="relative">
                    <input
                        className="w-full border border-gray-300 rounded-2xl py-3.5 sm:py-4 px-4 sm:px-6 pr-20 sm:pr-24 focus:ring-2 focus:outline-none focus:ring-[#205781]/10 focus:border-[#205781] text-sm sm:text-base placeholder-gray-500 bg-white transition-all duration-200 shadow-sm"
                        value={prompt}
                        onChange={handleInputChange}
                        onPaste={handlePaste}
                        placeholder="Ask here..."
                        disabled={isLoading}
                        maxLength={100}
                    />
                    <div className="absolute right-14 sm:right-16 top-1/2 -translate-y-1/2 text-xs text-gray-400 font-medium bg-white rounded px-1 py-0.5">
                        {prompt.length}/100
                    </div>
                    <button
                        className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 p-2.5 sm:p-3 text-[#205781] bg-white hover:bg-gray-50 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md border border-[#205781]/20"
                        type="submit"
                        disabled={isLoading || !prompt.trim()}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 sm:w-5 sm:h-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" />
                        </svg>
                    </button>
                </form>
            </div>
        </div>
    </div>
</div>
    );
}