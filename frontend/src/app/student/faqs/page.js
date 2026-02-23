"use client";
import React, { useEffect, useState, useRef } from 'react';
import Navigation from '../navigation';
import ReactMarkdown from "react-markdown";

export default function FAQS() {
    const [prompt, setPrompt] = useState("");
    const [messages, setMessages] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [conversationSession, setConversationSession] = useState(null);
    const [faqsByDepartment, setFaqsByDepartment] = useState([]);
    const [faqsLoading, setFaqsLoading] = useState(true);
    const messagesEndRef = useRef(null);
    const textareaRef = useRef(null);

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

    // Fetch FAQs organized by department with real-time updates
    useEffect(() => {
        const fetchFaqs = async () => {
            try {
                const response = await fetch("/api/admin/faqs");
                if (response.ok) {
                    const data = await response.json();
                    if (data.success && data.data) {
                        setFaqsByDepartment(data.data);
                        console.log('✓ FAQs updated successfully');
                    }
                }
            } catch (error) {
                console.error("Error fetching FAQs: ", error);
            } finally {
                setFaqsLoading(false);
            }
        };

        // Initial fetch
        fetchFaqs();

        // Set up real-time polling for FAQ updates
        const pollInterval = setInterval(() => {
            console.log('Polling FAQs for updates...');
            fetchFaqs();
        }, 30000); // Poll every 30 seconds

        // Cleanup interval on component unmount
        return () => {
            clearInterval(pollInterval);
            console.log('FAQ polling stopped');
        };
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
            // Auto-resize textarea up to 5 rows
            const textarea = textareaRef.current;
            if (textarea) {
                textarea.style.height = 'auto';
                const lineHeight = 24; // ~1.5rem line height
                const paddingY = 24;   // py-3 top + bottom
                const maxHeight = lineHeight * 5 + paddingY;
                textarea.style.height = Math.min(textarea.scrollHeight, maxHeight) + 'px';
            }
        }
    };

    const handlePaste = (e) => {
        e.preventDefault();
    };

    // Submit on Enter, allow Shift+Enter for new line (won't actually insert due to maxLength logic)
    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            if (!isLoading && prompt.trim()) {
                handleSubmitQuestion();
            }
        }
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
        if (userMessage === " " || isLoading) return;

        const newUserMessage = { type: 'user', content: userMessage, id: Date.now() };
        setMessages(prev => [...prev, newUserMessage]);

        if (!questionText) {
            setPrompt("");
            // Reset textarea height after clearing
            if (textareaRef.current) {
                textareaRef.current.style.height = 'auto';
            }
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

            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    const aiMessage = { type: 'ai', content: data.data.response, id: Date.now() + 1 };
                    setMessages(prev => [...prev, aiMessage]);
                    console.log('✓ Response received');
                }
            } else {
                throw new Error('Failed to get response');
            }
        } catch (error) {
            console.error("✗ Error: ", error);
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
        <div className="h-full min-h-screen bg-white flex flex-col overflow-hidden">
            <Navigation />

            {/* Main content - scrollbar visible above input and header */}
            <main className="flex-1 overflow-y-auto pt-[90px] pb-32 px-2 sm:px-6 lg:px-8 max-w-full relative z-10">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center my-6 sm:my-8 space-y-4">
                        <h2 className="text-xl sm:text-2xl md:text-3xl font-medium text-gray-600 leading-tight">
                            Good day! How may I assist you today?
                        </h2>
                        <p className="text-sm sm:text-base text-gray-600 max-w-2xl mx-auto leading-relaxed">
                            You can select from the options below or feel free to type your questions.
                        </p>
                    </div>

                    {/* FAQ Cards */}
                    <div className="mb-8">
                        {faqsLoading ? (
                            <div className="flex justify-center py-8">
                                <div className="animate-spin rounded-full h-8 w-8 border-2 border-[#205781] border-t-transparent" />
                            </div>
                        ) : faqsByDepartment?.length > 0 ? (
                            <div className="overflow-x-auto lg:overflow-visible pb-4">
                                <div className="flex gap-4 min-w-max lg:flex-wrap lg:justify-center lg:min-w-0">
                                    {faqsByDepartment.map((dept) => (
                                        <div
                                            key={dept.department_id}
                                            className="border border-gray-200 rounded-xl p-4 w-64 lg:w-72 flex-shrink-0 bg-white hover:border-[#205781]/20 transition-all shadow-sm hover:shadow-md"
                                        >
                                            <h2 className="font-semibold text-center mb-3 text-gray-800 text-sm line-clamp-2">
                                                {dept.department_name || "General"}
                                            </h2>
                                            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                                                {dept.faqs?.length > 0 ? (
                                                    dept.faqs.map((faq) => (
                                                        <button
                                                            key={faq.faq_id}
                                                            onClick={() => handlePreTypeQuestion(faq.full_question)}
                                                            disabled={isLoading}
                                                            className="w-full bg-white hover:bg-gray-50 disabled:opacity-50 text-gray-600 text-xs px-3 py-2 rounded-lg transition text-left line-clamp-2 font-medium shadow-sm border border-gray-200"
                                                            title={faq.full_question}
                                                        >
                                                            {faq.question}
                                                        </button>
                                                    ))
                                                ) : (
                                                    <p className="text-xs text-gray-400 text-center py-2">No FAQs available</p>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-8 text-gray-500">
                                <p>No FAQs available at the moment.</p>
                            </div>
                        )}
                    </div>

                    {/* Chat Messages */}
                    <div className="space-y-4 max-w-3xl mx-auto">
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
                                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-[#205781] border-t-transparent" />
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>
                </div>
            </main>

            {/* Chat Input - Fixed at bottom */}
            <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-gray-200 z-20 p-3 sm:p-4">
                {/* Scoped scrollbar styles: keeps the scrollbar visually inside the rounded border */}
                <style>{`
                    .chat-textarea::-webkit-scrollbar {
                        width: 6px;
                    }
                    .chat-textarea::-webkit-scrollbar-track {
                        background: transparent;
                        margin: 10px 0;
                    }
                    .chat-textarea::-webkit-scrollbar-thumb {
                        background-color: #cbd5e1;
                        border-radius: 999px;
                    }
                    .chat-textarea::-webkit-scrollbar-thumb:hover {
                        background-color: #94a3b8;
                    }
                    /* Firefox */
                    .chat-textarea {
                        scrollbar-width: thin;
                        scrollbar-color: #cbd5e1 transparent;
                    }
                `}</style>

                <form onSubmit={submit} className="max-w-3xl mx-auto">
                    {/* Character count shown above textarea */}
                    <div className="flex justify-end mb-1 px-1">
                        <span className="text-xs text-gray-400">{prompt.length}/100</span>
                    </div>
                    <div className="flex items-end gap-2">
                        {/*
                            Wrapper clips the scrollbar so it never bleeds outside the rounded border.
                            overflow-hidden + rounded-2xl + border here replaces the border on textarea itself.
                        */}
                        <div
                            className="flex-1 border border-gray-300 rounded-2xl shadow-sm overflow-hidden
                                       focus-within:ring-2 focus-within:ring-[#205781]/10 focus-within:border-[#205781]
                                       transition-colors"
                        >
                            <textarea
                                ref={textareaRef}
                                className="
                                    chat-textarea
                                    w-full py-3 px-4
                                    focus:outline-none
                                    text-sm placeholder-gray-500
                                    bg-white text-gray-900
                                    [color-scheme:light]
                                    resize-none overflow-y-auto leading-6
                                    disabled:opacity-60
                                "
                                style={{ minHeight: '48px', maxHeight: '144px' }}
                                rows={1}
                                value={prompt}
                                onChange={handleInputChange}
                                onPaste={handlePaste}
                                onKeyDown={handleKeyDown}
                                placeholder="Ask here..."
                                disabled={isLoading}
                                maxLength={100}
                            />
                        </div>
                        <button
                            className="flex-shrink-0 p-2 text-[#205781] bg-white rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed shadow-sm border border-[#205781]/20 mb-0.5"
                            type="submit"
                            disabled={isLoading || !prompt.trim()}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" />
                            </svg>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}