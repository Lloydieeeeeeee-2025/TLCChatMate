"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

export default function Success({ isOpen, onClose, message, body, link, save }) {
    const [successModal, setSuccessModal] = useState(false)
    const router = useRouter()

    // Handle controlled vs uncontrolled
    useEffect(() => {
        if (isOpen !== undefined) {
            setSuccessModal(isOpen)
        }
    }, [isOpen])

    const handleClose = () => {
        setSuccessModal(false)
        if (onClose) onClose()
        if (link) {
            router.push(link)
        }
    }

    const modalContent = (
        <div className="fixed top-0 right-0 left-0 z-[110] flex justify-center items-start w-full h-full bg-gray-500/20 overflow-y-auto overflow-x-hidden pt-10 px-4">
            <div className="relative w-full max-w-md max-h-full">
                <div className="relative bg-white border border-gray-300 rounded-sm shadow-sm p-4 md:p-6 animate-in fade-in slide-in-from-top-4 duration-300">
                    <button
                        type="button"
                        onClick={handleClose}
                        className="absolute top-3 end-2.5 text-gray-400 bg-transparent hover:bg-gray-100 hover:text-gray-900 rounded-lg text-sm w-9 h-9 ms-auto inline-flex justify-center items-center"
                    >
                        <svg className="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18 17.94 6M18 18 6.06 6" />
                        </svg>
                        <span className="sr-only">Close modal</span>
                    </button>
                    <div className="p-4 md:p-5 text-center">
                        <h3 className="mb-2 text-lg font-bold text-gray-900">
                            {message || "Success!"}
                        </h3>
                        <p className="mb-6 text-sm text-gray-500 font-medium font-gray-600">
                            {body || "Your operation was completed successfully."}
                        </p>
                        <div className="flex items-center space-x-4 justify-center">
                            <button
                                onClick={handleClose}
                                type="button"
                                className="text-white bg-[#205781] box-border border border-transparent hover:bg-[#1a4a6b] focus:ring-4 focus:ring-blue-200 shadow-sm font-medium leading-5 rounded-sm text-sm px-8 py-2.5 focus:outline-none transition-all"
                            >
                                Okay
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )

    if (save) {
        return (
            <main>
                <div className="flex justify-center">
                    <button
                        onClick={async (e) => {
                            const result = await save(e);
                            if (result) setSuccessModal(true)
                        }}
                        className="text-white bg-[#205781] box-border border border-transparent hover:bg-[#1a4a6b] focus:ring-4 focus:ring-blue-200 shadow-sm font-medium leading-5 rounded-sm text-sm px-6 py-2.5 focus:outline-none transition-all"
                        type="button"
                    >
                        Save
                    </button>
                </div>
                {successModal && modalContent}
            </main>
        )
    }

    return successModal ? modalContent : null
}
