"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"

export default function RemoveFaq({ id, name, link, className }) {
    const router = useRouter()
    const [showModal, setShowModal] = useState(false)

    const removeDepartmentAndFaqs = async () => {
        try {
            // First, fetch all FAQs for this department
            const faqsResponse = await fetch(`/api/admin/faqs?department_id=${id}`)
            const faqsData = await faqsResponse.json()

            if (faqsData.success && faqsData.data && faqsData.data.length > 0) {
                // Delete each FAQ
                for (const faq of faqsData.data) {
                    await fetch("/api/admin/faqs", {
                        method: "DELETE",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ faq_id: faq.faq_id }),
                    })
                }
            }

            // Then delete the department
            const deptResponse = await fetch("/api/admin/departments", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ department_id: id }),
            })

            const deptData = await deptResponse.json()

            if (deptResponse.ok && deptData.success) {
                setShowModal(false)
                router.refresh() // Trigger a refresh instead of just redirecting if needed
                router.push(link)
            } else {
                setShowModal(false)
            }
        } catch (err) {
            console.error("Error removing department and FAQs:", err)
            setShowModal(false)
        }
    }

    return (
        <>
            <div className={className}>
                <button
                    onClick={() => setShowModal(true)}
                    className="text-red-500 hover:text-red-700 p-2 transition-colors flex items-center gap-2"
                    type="button"
                    title="Delete"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                    </svg>
                    <span className="md:hidden">Delete</span>
                </button>
            </div>

            {showModal && (
                <div id="popup-modal" tabIndex="-1" className="fixed top-0 right-0 left-0 z-[100] flex justify-center items-start w-full h-full bg-gray-500/75 overflow-y-auto overflow-x-hidden pt-10 px-4">
                    <div className="relative w-full max-w-md max-h-full">
                        <div className="relative bg-white border border-gray-300 rounded-sm shadow-sm p-4 md:p-6 animate-in fade-in slide-in-from-top-4 duration-300">
                            <button
                                type="button"
                                onClick={() => setShowModal(false)}
                                className="absolute top-3 end-2.5 text-gray-400 bg-transparent hover:bg-gray-100 hover:text-gray-900 rounded-lg text-sm w-9 h-9 ms-auto inline-flex justify-center items-center"
                            >
                                <svg className="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18 17.94 6M18 18 6.06 6" />
                                </svg>
                                <span className="sr-only">Close modal</span>
                            </button>
                            <div className="p-4 md:p-5 text-center">
                                <svg className="mx-auto mb-4 text-gray-400 w-12 h-12" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 13V8m0 8h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                                </svg>
                                <h3 className="mb-6 text-gray-600 font-medium">Are you sure you want to remove {name || id}? This will also remove all FAQs in this department.</h3>
                                <div className="flex items-center space-x-4 justify-center">
                                    <button
                                        onClick={removeDepartmentAndFaqs}
                                        type="button"
                                        className="text-white bg-red-600 box-border border border-transparent hover:bg-red-700 focus:ring-4 focus:ring-red-200 shadow-sm font-medium leading-5 rounded-sm text-sm px-4 py-2.5 focus:outline-none transition-all"
                                    >
                                        Yes, I'm sure
                                    </button>
                                    <button
                                        onClick={() => setShowModal(false)}
                                        type="button"
                                        className="text-gray-600 bg-white box-border border border-gray-300 hover:bg-gray-50 focus:ring-4 focus:ring-gray-100 shadow-sm font-medium leading-5 rounded-sm text-sm px-4 py-2.5 focus:outline-none transition-all"
                                    >
                                        No, cancel
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}
