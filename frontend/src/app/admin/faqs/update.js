"use client"
import { useState, useEffect } from "react"

export default function Update({ open, close, selectedFaqRow }) {
    const [departmentName, setDepartmentName] = useState("")
    const [faqInputField, setFaqInputField] = useState("")
    const [faqError, setFaqError] = useState("")
    const [faqsList, setFaqsList] = useState([])
    const [loading, setLoading] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)

    useEffect(() => {
        if (open && selectedFaqRow) {
            setDepartmentName(selectedFaqRow.department_name || "")
            fetchFaqsForDepartment(selectedFaqRow.department_id)
        }
    }, [open, selectedFaqRow])

    const fetchFaqsForDepartment = async (departmentId) => {
        setLoading(true)
        try {
            const response = await fetch(`/api/admin/faqs?department_id=${departmentId}`)
            if (response.ok) {
                const data = await response.json()
                if (data.success) {
                    setFaqsList(Array.isArray(data.data) ? data.data : [])
                }
            }
        } catch (err) {
            console.error("Error fetching FAQs:", err)
            setFaqsList([])
        } finally {
            setLoading(false)
        }
    }

    const addFaq = async () => {
        setFaqError("")

        if (!faqInputField || faqInputField.trim() === "") {
            setFaqError("Question cannot be empty.")
            return
        }

        const trimmedQuestion = faqInputField.trim()

        if (trimmedQuestion.length > 500) {
            setFaqError("Question must be 500 characters or less.")
            return
        }

        // Check for duplicate in this department
        const isDuplicate = faqsList.some(faq =>
            faq.question.toLowerCase() === trimmedQuestion.toLowerCase()
        )

        if (isDuplicate) {
            setFaqError("This question already exists in this department.")
            return
        }

        setIsSubmitting(true)
        try {
            const response = await fetch("/api/admin/faqs", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    question: trimmedQuestion,
                    department_id: selectedFaqRow.department_id,
                }),
            })

            const data = await response.json()
            if (!response.ok) {
                setFaqError(data.message || "Failed to add FAQ.")
                setIsSubmitting(false)
                return
            }

            setFaqInputField("")
            await fetchFaqsForDepartment(selectedFaqRow.department_id)
        } catch (err) {
            console.error("Error:", err)
            setFaqError("An error occurred while adding the FAQ.")
            setIsSubmitting(false)
        } finally {
            setIsSubmitting(false)
        }
    }

    const removeFaq = async (faqId) => {
        try {
            const response = await fetch("/api/admin/faqs", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ faq_id: faqId }),
            })

            if (!response.ok) {
                setFaqError("Failed to delete FAQ.")
                return
            }

            await fetchFaqsForDepartment(selectedFaqRow.department_id)
        } catch (err) {
            console.error("Error:", err)
            setFaqError("An error occurred while deleting the FAQ.")
        }
    }

    return (
        <main>
            <div className={`fixed inset-0 ${open ? "opacity-50" : "opacity-0 pointer-events-none"}`} onClick={close}></div>
            <div className={`fixed top-0 right-0 h-full w-full md:w-[35%] bg-white border-l border-gray-200 transform transition-transform duration-300 ${open ? "translate-x-0" : "translate-x-full"}`}>
                <div className="flex flex-col h-full p-5 space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-semibold">Update FAQ</h2>
                        <button onClick={close} className="text-gray-600 hover:text-black">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto">
                        {loading ? (
                            <div className="flex flex-col justify-center items-center py-16">
                                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#205781]"></div>
                                <p className="mt-4 text-sm text-gray-500">Loading FAQs...</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {/* Department Section - Read Only */}
                                <div>
                                    <div className="mb-4 w-full flex justify-between items-center">
                                        <h2 className="text-lg font-semibold mb-2">Department</h2>
                                        <button onClick={close} className="text-gray-600 hover:text-black">
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                                            </svg>
                                        </button>
                                    </div>
                                    <div className="w-full border border-gray-300 p-2.5 bg-gray-50 text-gray-600 rounded">
                                        {departmentName}
                                    </div>
                                </div>

                                {/* FAQs Section */}
                                <div>
                                    <h3 className="font-bold mb-2">FAQs</h3>
                                    <div className="mb-3 w-full flex items-stretch gap-2">
                                        <input
                                            value={faqInputField}
                                            onChange={(e) => setFaqInputField(e.target.value)}
                                            placeholder=""
                                            className="flex-1 border border-gray-300 p-2.5 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-transparent rounded transition duration-200"
                                            disabled={isSubmitting}
                                        />
                                        <button
                                            type="button"
                                            className="bg-gray-200 hover:bg-gray-300 p-2.5 transition duration-200 disabled:opacity-50 rounded"
                                            onClick={addFaq}
                                            disabled={isSubmitting}
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="size-5">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                                            </svg>
                                        </button>
                                    </div>

                                    {faqError && (
                                        <span className="text-sm block text-red-600 mb-3">{faqError}</span>
                                    )}

                                    <div className="space-y-2">
                                        {faqsList.length > 0 ? (
                                            faqsList.map((item) => (
                                                <div key={item.faq_id} className="flex w-full items-center justify-between p-2">
                                                    <span className="text-gray-700 flex-1 text-sm">{item.question}</span>
                                                    <button
                                                        type="button"
                                                        className="text-gray-500 hover:text-red-600 transition duration-200 flex-shrink-0"
                                                        onClick={() => removeFaq(item.faq_id)}
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-5">
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14" />
                                                        </svg>
                                                    </button>
                                                </div>
                                            ))
                                        ) : (
                                            <p className="text-sm text-gray-400 text-center py-4">No questions yet</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    <button
                        className="w-full bg-gray-200 hover:bg-gray-300 transition duration-400 p-2.5 rounded font-medium"
                        onClick={close}
                    >
                        Close
                    </button>
                </div>
            </div>
        </main>
    )
}