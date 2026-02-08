"use client";

import React, { useEffect, useState, useRef } from 'react';
import ReactMarkdown from "react-markdown";

export default function ChatWidget() {
    const [prompt, setPrompt] = useState("");
    const [messages, setMessages] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [conversationSession, setConversationSession] = useState(null);
    const [faqQuestions, setFaqQuestions] = useState([]);
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

    // Fetch FAQs
    useEffect(() => {
        const fetchFaqs = async () => {
            try {
                const response = await fetch("/api/admin/faqs");
                if (response.ok) {
                    const data = await response.json();
                    if (data.success) {
                        setFaqQuestions(data.data);
                    }
                }
            } catch (error) {
                console.error("Error fetching FAQs:", error);
            } finally {
                setFaqsLoading(false);
            }
        };

        fetchFaqs();
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
                <div className="max-w-[85%] bg-gradient-to-br from-[#205781] to-[#2a6ba0] text-white rounded-2xl rounded-br-md px-5 py-3.5 shadow-lg">
                    <div className="text-sm leading-relaxed">{message}</div>
                </div>
            </div>
        );
    };

    const AIMessage = ({ message }) => {
        return (
            <div className="flex justify-start mb-6">
                <div className="max-w-[85%] bg-white/80 backdrop-blur-sm rounded-2xl rounded-bl-md px-5 py-3.5 shadow-md border border-gray-100">
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

            const aiResponse = data.response || "I don't have enough information to answer that question. Please visit The Lewis College for more details.";

            const newAIMessage = { type: 'ai', content: aiResponse, id: Date.now() + 1 };
            setMessages(prev => [...prev, newAIMessage]);

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
        <div className="min-h-screen bg-white flex flex-col">
            {/* Header */}
            <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-2">
                <img className="object-contain h-7 w-auto" src="/favicon.ico" alt="TLC Logo" />
                <h1 className="text-lg font-bold">
                    <span className="text-[#205781]">TLC ChatMate</span>
                </h1>
            </header>

            {/* Messages Area */}
            <main className="flex-1 overflow-y-auto px-4 py-6">
                <div className="max-w-2xl mx-auto space-y-6">
                    {/* Welcome Message */}
                    {messages.length === 0 && (
                        <div className="text-center my-8 space-y-4">
                            <h2 className="text-xl font-medium text-gray-600">
                                How may I assist you?
                            </h2>
                            <p className="text-sm text-gray-500">
                                Select a question or type your own
                            </p>
                        </div>
                    )}

                    {/* FAQ Questions */}
                    {messages.length === 0 && (
                        <div className="space-y-2">
                            {faqsLoading ? (
                                <div className="flex justify-center py-6">
                                    <div className="animate-spin rounded-full h-6 w-6 border-2 border-[#205781] border-t-transparent"></div>
                                </div>
                            ) : faqQuestions.length > 0 ? (
                                faqQuestions.slice(0, 5).map((faq) => (
                                    <button
                                        key={faq.faq_id}
                                        onClick={() => handlePreTypeQuestion(faq.question)}
                                        disabled={isLoading}
                                        className="block w-full text-left p-3 rounded-lg bg-white/60 border border-gray-200 hover:border-[#205781]/30 hover:shadow-sm transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-[#205781]/30 disabled:opacity-50 text-sm"
                                    >
                                        <div className="font-medium text-gray-800">
                                            {faq.question.length > 60 ? faq.question.substring(0, 60) + '...' : faq.question}
                                        </div>
                                    </button>
                                ))
                            ) : null}
                        </div>
                    )}

                    {/* Chat Messages */}
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
                        <div className="flex justify-start">
                            <div className="max-w-[85%] bg-white/80 rounded-2xl rounded-bl-md px-5 py-3.5 shadow-md border border-gray-100">
                                <div className="flex items-center space-x-2">
                                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-[#205781] border-t-transparent"></div>
                                </div>
                            </div>
                        </div>
                    )}

                    <div ref={messagesEndRef} />
                </div>
            </main>

            {/* Input Area */}
            <div className="bg-white border-t border-gray-200 p-3">
                <form onSubmit={submit} className="relative">
                    <input
                        className="w-full border-2 border-gray-300 rounded-xl py-3 px-4 pr-14 focus:ring-2 focus:outline-none focus:ring-[#205781]/20 focus:border-[#205781] text-sm placeholder-gray-500 bg-white transition-all duration-200"
                        value={prompt}
                        onChange={handleInputChange}
                        onPaste={handlePaste}
                        placeholder="Ask here..."
                        disabled={isLoading}
                        maxLength={100}
                    />
                    <div className="absolute right-12 top-1/2 -translate-y-1/2 text-xs text-gray-400 font-medium">
                        {prompt.length}/100
                    </div>
                    <button
                        className="absolute right-1.5 top-1/2 -translate-y-1/2 p-2 text-white bg-[#205781] hover:bg-[#1a4660] rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        type="submit"
                        disabled={isLoading || !prompt.trim()}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" />
                        </svg>
                    </button>
                </form>
            </div>
        </div>
    );
}