"use client"

export default function Navigation() {
    const isEmbedded = typeof window !== 'undefined' && window.parent !== window;

    return (
        <header className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-40">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                {/* Logo on left */}
                <div className="flex items-center">
                    <img className="object-contain h-8 sm:h-10 lg:h-12 w-auto mr-2" src="/favicon.ico" alt="TLC Logo" />
                    <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold">
                        <span className="text-[#205781]">TLC ChatMate</span>
                    </h1>
                </div>

                {/* Close button on right - only for embedded mode */}
                {isEmbedded && (
                    <button
                        onClick={() => window.parent.postMessage('tlc-close', '*')}
                        className="p-2 rounded-full hover:bg-gray-100 transition-colors z-50"
                        aria-label="Close chat"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6 text-gray-700">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                        </svg>
                    </button>
                )}
            </div>
        </header>
    )
}