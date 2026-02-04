"use client"
import { useState } from "react"

export default function Create({ open, close }) {
    const [question, setQuestion] = useState("")
    const [questionError, setQuestionError] = useState("")

    const submit = async () => {
        setQuestionError("")
        
        // Question validation
        if (!question || question.trim() === "") {
            setQuestionError("Question is required.")
            return
        }
        
        if (question.length > 100) {
            setQuestionError("Question must be less than 500 characters.")
            return
        }
        
        try {
            const res = await fetch("/api/admin/faqs", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    question: question.trim(),
                }),
            })
            const data = await res.json()
            if (!res.ok) {
                if (res.status === 409) {
                    setQuestionError("This question already exists.")
                } else if (res.status === 400) {
                    setQuestionError(data.message || "Invalid input.")
                } else {
                    setQuestionError("An unexpected error occurred.")
                }
                return
            }
            setQuestion("")
            close()
            window.location.reload()
        } catch (err) {
            console.error("Error:", err.message)
            setQuestionError("An error occurred while creating the FAQ.")
        }
    }

    return (
        <main className="z-500">
            <div className={`fixed inset-0 duration-300 ${open ? "opacity-100" : "opacity-0 pointer-events-none"}`} onClick={close}></div>
            <div className={`fixed top-0 right-0 h-full w-full md:w-[30%] bg-white border-l border-gray-200 transform transition-transform duration-300 ${open ? "translate-x-0" : "translate-x-full"}`}>
                <div className="flex flex-col h-full p-5 space-y-4">
                    <div>
                        <button onClick={close} className="text-gray-600 hover:text-black">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                    <div className="flex flex-col h-full">
                        <div className="mb-4 w-full flex justify-between items-center">
                            <h2 className="text-lg font-semibold mb-2">Add New FAQ</h2>
                            <button onClick={close} className="text-gray-600 hover:text-black">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <div className="w-full flex-1 overflow-y-auto">
                            <div className="space-y-4 md:space-y-6">
                                <div className="space-y-2">
                                    <label htmlFor="question" className="block text-sm font-medium text-gray-700">Question</label>
                                    <textarea 
                                        id="question" 
                                        name="question" 
                                        value={question} 
                                        onChange={(e) => setQuestion(e.target.value)} 
                                        placeholder="Enter the question"
                                        rows="3"
                                        className="w-full border border-gray-200 p-2 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-transparent resize-none" 
                                    />
                                    <div className="text-xs text-gray-500 text-right">
                                        {question.length}/100 characters
                                    </div>
                                    {questionError && <span className="text-red-600 text-sm mt-1 block">{questionError}</span>}
                                </div>
                            </div>
                        </div>
                    </div>
                    <button className="w-full bg-gray-200 hover:bg-gray-300 transition duration-400 p-2 rounded-lg" onClick={submit}>Save</button>
                </div>
            </div>
        </main>
    )
}