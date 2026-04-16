"use client"
import React from 'react';

export default function ConfirmModal({ isOpen, onClose, onConfirm, title, message, confirmText, cancelText, type = "danger" }) {
    if (!isOpen) return null;

    return (
        <div id="confirm-modal" tabIndex="-1" className="fixed top-0 right-0 left-0 z-[100] flex justify-center items-start w-full h-full bg-gray-500/75 overflow-y-auto overflow-x-hidden pt-10 px-4">
            <div className="relative p-4 w-full max-w-md max-h-full">
                <div className="relative bg-white border border-gray-300 rounded-sm shadow-sm p-4 md:p-6 animate-in fade-in slide-in-from-top-4 duration-300">
                    <button
                        type="button"
                        onClick={onClose}
                        className="absolute top-3 end-2.5 text-gray-400 bg-transparent hover:bg-gray-100 hover:text-gray-900 rounded-lg text-sm w-9 h-9 ms-auto inline-flex justify-center items-center"
                    >
                        <svg className="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18 17.94 6M18 18 6.06 6" />
                        </svg>
                        <span className="sr-only">Close modal</span>
                    </button>
                    <div className="p-4 md:p-5 text-center">
                        <svg className={`mx-auto mb-4 ${type === 'danger' ? 'text-red-400' : 'text-[#205781]'} w-12 h-12`} aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 13V8m0 8h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                        </svg>
                        <p className="mb-6 text-gray-600 font-medium">{message}</p>
                        <div className="flex items-center space-x-4 justify-center">
                            <button
                                onClick={() => { onConfirm(); onClose(); }}
                                type="button"
                                className={`text-white ${type === 'danger' ? 'bg-red-600 hover:bg-red-700' : 'bg-[#205781] hover:bg-[#1a4a6b]'} box-border border border-transparent focus:ring-4 ${type === 'danger' ? 'focus:ring-red-200' : 'focus:ring-blue-100'} shadow-sm font-medium leading-5 rounded-sm text-sm px-4 py-2.5 focus:outline-none transition-all`}
                            >
                                {confirmText || "Yes, I'm sure"}
                            </button>
                            <button
                                onClick={onClose}
                                type="button"
                                className="text-gray-600 bg-white box-border border border-gray-300 hover:bg-gray-50 focus:ring-4 focus:ring-gray-100 shadow-sm font-medium leading-5 rounded-sm text-sm px-4 py-2.5 focus:outline-none transition-all"
                            >
                                {cancelText || "No, cancel"}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
