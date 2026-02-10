"use client"
import { useState } from "react"

export default function Create({ open, close, onFaqCreated }) {
    const [departmentInputField, setDepartmentInputField] = useState("")
    const [faqInputField, setFaqInputField] = useState("")
    const [departmentError, setDepartmentError] = useState("")
    const [faqError, setFaqError] = useState("")
    const [faqsList, setFaqsList] = useState([])
    const [isSubmitting, setIsSubmitting] = useState(false)

    const addFaq = () => {
        setFaqError("")

        if (!departmentInputField || departmentInputField.trim() === "") {
            setFaqError("Please enter a department name first.")
            return
        }

        if (!faqInputField || faqInputField.trim() === "") {
            setFaqError("Question cannot be empty.")
            return
        }

        const trimmedQuestion = faqInputField.trim()

        if (trimmedQuestion.length > 500) {
            setFaqError("Question must be 500 characters or less.")
            return
        }

        // Check for duplicate in this list
        const isDuplicate = faqsList.some(faq =>
            faq.toLowerCase() === trimmedQuestion.toLowerCase()
        )

        if (isDuplicate) {
            setFaqError("This question already exists.")
            return
        }

        setFaqsList([...faqsList, trimmedQuestion])
        setFaqInputField("")
    }

    const removeFaq = (indexToRemove) => {
        setFaqsList(faqsList.filter((_, index) => index !== indexToRemove))
    }

    const submit = async () => {
        setDepartmentError("")
        setFaqError("")

        if (!departmentInputField || departmentInputField.trim() === "") {
            setDepartmentError("Department name is required.")
            return
        }

        if (faqsList.length === 0) {
            setFaqError("Please add at least one question.")
            return
        }

        setIsSubmitting(true)

        try {
            // First, create the department
            const deptResponse = await fetch("/api/admin/departments", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    department_name: departmentInputField.trim(),
                }),
            })

            const deptData = await deptResponse.json()

            if (!deptResponse.ok) {
                if (deptResponse.status === 409) {
                    setDepartmentError("This department already exists.")
                } else {
                    setDepartmentError(deptData.message || "Failed to create department.")
                }
                setIsSubmitting(false)
                return
            }

            const departmentId = deptData.data.department_id

            // Then, create all FAQs for this department
            for (const question of faqsList) {
                await fetch("/api/admin/faqs", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        question: question,
                        department_id: departmentId,
                    }),
                })
            }

            setDepartmentInputField("")
            setFaqsList([])
            setFaqInputField("")
            onFaqCreated()
            close()
        } catch (err) {
            console.error("Error:", err)
            setDepartmentError("An error occurred while creating the department and FAQs.")
            setIsSubmitting(false)
        }
    }

    return (
        <main className="z-500">
            <div className={`fixed inset-0 ${open ? "opacity-50" : "opacity-0 pointer-events-none"}`} onClick={close}></div>
            <div className={`fixed top-0 right-0 h-full w-full md:w-[35%] bg-white border-l border-gray-200 transform transition-transform duration-300 ${open ? "translate-x-0" : "translate-x-full"}`}>
                <div className="flex flex-col h-full p-5 space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-semibold">Add New FAQ</h2>
                        <button onClick={close} className="text-gray-600 hover:text-black">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto">
                        <div className="space-y-4">
                            {/* Department Section */}
                            <div>
                                <div className="mb-4 w-full flex justify-between items-center">
                                    <h2 className="text-lg font-semibold mb-2">Department</h2>
                                    <button onClick={close} className="text-gray-600 hover:text-black">
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>
                                <input
                                    value={departmentInputField}
                                    onChange={(e) => setDepartmentInputField(e.target.value)}
                                    placeholder=""
                                    className="w-full border border-gray-300 p-2.5 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-transparent rounded"
                                    disabled={isSubmitting}
                                />
                                {departmentError && (
                                    <span className="text-sm mt-2 block text-red-600">{departmentError}</span>
                                )}
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
                                    {faqsList.map((item, index) => (
                                        <div key={index} className="flex w-full items-center justify-between p-2">
                                            <span className="text-gray-700 text-sm">{item}</span>
                                            <button
                                                type="button"
                                                className="text-gray-500 hover:text-red-600 transition duration-200 flex-shrink-0"
                                                onClick={() => removeFaq(index)}
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-5">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14" />
                                                </svg>
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    <button
                        className="w-full bg-gray-200 hover:bg-gray-300 transition duration-400 p-2.5 rounded font-medium disabled:opacity-50"
                        onClick={submit}
                        disabled={isSubmitting}
                    >
                        Save
                    </button>
                </div>
            </div>
        </main>
    )
}