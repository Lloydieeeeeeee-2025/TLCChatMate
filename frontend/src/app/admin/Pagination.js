"use client"
import React from 'react'

export default function Pagination({ currentPage, totalPages, totalResults, resultsPerPage, onPageChange }) {
    const startResult = (currentPage - 1) * resultsPerPage + 1
    const endResult = Math.min(currentPage * resultsPerPage, totalResults)

    if (totalPages === 0) return null

    return (
        <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6 sticky bottom-0 z-10 w-full shadow-sm">
            <div className="flex flex-1 justify-between sm:hidden">
                <button
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center rounded-sm border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-all"
                >
                    Previous
                </button>
                <button
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="relative ml-3 inline-flex items-center rounded-sm border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-all"
                >
                    Next
                </button>
            </div>
            <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                <div>
                    <p className="text-sm text-gray-600">
                        Showing <span className="font-medium text-gray-900">{totalResults > 0 ? startResult : 0}</span> to <span className="font-medium text-gray-900">{endResult}</span> of <span className="font-medium text-gray-900">{totalResults}</span> results
                    </p>
                </div>
                <div>
                    <nav aria-label="Pagination" className="isolate inline-flex -space-x-px rounded-sm shadow-sm border border-gray-300 overflow-hidden">
                        <button
                            onClick={() => onPageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="relative inline-flex items-center px-2 py-2 text-gray-400 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 transition-all"
                        >
                            <span className="sr-only">Previous</span>
                            <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" className="size-5">
                                <path d="M11.78 5.22a.75.75 0 0 1 0 1.06L8.06 10l3.72 3.72a.75.75 0 1 1-1.06 1.06l-4.25-4.25a.75.75 0 0 1 0-1.06l4.25-4.25a.75.75 0 0 1 1.06 0Z" clipRule="evenodd" fillRule="evenodd" />
                            </svg>
                        </button>

                        {[...Array(totalPages)].map((_, i) => {
                            const page = i + 1
                            const isCurrent = page === currentPage
                            return (
                                <button
                                    key={page}
                                    onClick={() => onPageChange(page)}
                                    aria-current={isCurrent ? "page" : undefined}
                                    className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold transition-all ${isCurrent
                                            ? "z-10 bg-[#205781] text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#205781]"
                                            : "text-gray-900 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 border-l border-gray-300"
                                        }`}
                                >
                                    {page}
                                </button>
                            )
                        })}

                        <button
                            onClick={() => onPageChange(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            className="relative inline-flex items-center px-2 py-2 text-gray-400 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 border-l border-gray-300 transition-all"
                        >
                            <span className="sr-only">Next</span>
                            <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" className="size-5">
                                <path d="M8.22 5.22a.75.75 0 0 1 1.06 0l4.25 4.25a.75.75 0 0 1 0 1.06l-4.25 4.25a.75.75 0 0 1-1.06-1.06L11.94 10 8.22 6.28a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" fillRule="evenodd" />
                            </svg>
                        </button>
                    </nav>
                </div>
            </div>
        </div>
    )
}
