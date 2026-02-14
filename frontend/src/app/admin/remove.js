"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createPortal } from "react-dom"

export default function Remove({ id, name, link, apiroute, onSuccess, className, children, message }) {
    const router = useRouter()
    const [showModal, setShowModal] = useState(false)
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    const [error, setError] = useState(null)

    const handleRemove = async () => {
        setError(null)
        try {
            const bodyContent = typeof id === 'object' ? id : { id };
            const response = await fetch(apiroute, {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(bodyContent),
            })

            const data = await response.json()

            if (response.ok && data.success) {
                setShowModal(false)
                if (onSuccess) {
                    onSuccess(id)
                } else if (link) {
                    router.push(link)
                }
            } else {
                setError(data.message || "Failed to delete item.")
            }
        } catch (err) {
            setError("An unexpected error occurred.")
        }
    }

    const modal = showModal && mounted ? createPortal(
        <div id="popup-modal" tabIndex="-1" className="fixed inset-0 z-[120] flex justify-center items-center w-full h-full bg-gray-500/20 overflow-y-auto overflow-x-hidden px-4">
            <div className="relative w-full max-w-md max-h-full" onClick={(e) => e.stopPropagation()}>
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
                        <h3 className="mb-4 text-gray-600 font-medium">
                            {message || `Are you sure you want to delete ${name || id}?`}
                        </h3>
                        {error && (
                            <div className="mb-4 text-sm text-red-600 bg-red-50 p-2 rounded border border-red-100 italic">
                                {error}
                            </div>
                        )}
                        <div className="flex items-center space-x-4 justify-center">
                            <button
                                onClick={handleRemove}
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
        </div>,
        document.body
    ) : null

    return (
        <>
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    setError(null);
                    setShowModal(true);
                }}
                className={className || "text-red-500 hover:text-red-700 p-2 transition-colors"}
                type="button"
                title="Delete"
            >
                {children || (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                    </svg>
                )}
            </button>

            {modal}
        </>
    )
}