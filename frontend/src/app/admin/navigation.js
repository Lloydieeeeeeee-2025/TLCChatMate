"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useEffect, useState, useRef } from "react"

export default function Navigation() {
    const get_current_page = usePathname()
    const router = useRouter()
    const [isMenuActive, setIsMenuActive] = useState(false)
    const [dropdownOpen, setDropdownOpen] = useState(false)
    const [userData, setUserData] = useState(null)
    const [hasUpdates, setHasUpdates] = useState(false)
    const [isSyncing, setIsSyncing] = useState(false)
    const [syncProgress, setSyncProgress] = useState({ step: null, status: "idle" })
    const pollingInterval = useRef(null)

    useEffect(() => {
        const storedUserData = localStorage.getItem("userData")
        if (storedUserData) {
            setUserData(JSON.parse(storedUserData))
        } else {
            router.push("/")
        }

        checkUpdates()
        checkInitialSyncStatus()

        // Periodically check for updates if not syncing
        const updateInterval = setInterval(() => {
            if (!isSyncing) checkUpdates()
        }, 30000)

        return () => {
            clearInterval(updateInterval)
            if (pollingInterval.current) clearInterval(pollingInterval.current)
        }
    }, [router])

    const checkUpdates = async () => {
        try {
            const response = await fetch("/api/admin/check-updates")
            const data = await response.json()
            setHasUpdates(data.updates_available)
        } catch (error) {
            console.error("Error checking updates:", error)
        }
    }

    const checkInitialSyncStatus = async () => {
        try {
            const response = await fetch("/api/admin/sync-status")
            const data = await response.json()
            if (data.status === "running") {
                setIsSyncing(true)
                setSyncProgress(data)
                startPolling()
            }
        } catch (error) {
            console.error("Error checking sync status:", error)
        }
    }

    const startPolling = () => {
        if (pollingInterval.current) clearInterval(pollingInterval.current)
        pollingInterval.current = setInterval(async () => {
            try {
                const response = await fetch("/api/admin/sync-status")
                const data = await response.json()
                setSyncProgress(data)
                if (data.status === "completed" || data.status === "error") {
                    if (data.status === "completed") {
                        setHasUpdates(false)
                    }
                    clearInterval(pollingInterval.current)
                }
            } catch (error) {
                console.error("Error polling sync status:", error)
            }
        }, 2000)
    }

    const handleApplyChanges = async () => {
        try {
            const response = await fetch("/api/admin/sync", { method: "POST" })
            const data = await response.json()
            if (data.success) {
                setIsSyncing(true)
                startPolling()
            }
        } catch (error) {
            console.error("Error triggering sync:", error)
        }
    }

    const closeProgressModal = () => {
        setIsSyncing(false)
        if (syncProgress.status !== "running") {
            setSyncProgress({ step: null, status: "idle" })
        }
    }

    const navLinks = [
        {
            href: "/admin/handbook",
            label: "Handbook",
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v17.25m0 0c-1.472 0-2.882.265-4.185.75M12 20.25c1.472 0 2.882.265 4.185.75M18.75 4.97A48.416 48.416 0 0 0 12 4.5c-2.291 0-4.545.16-6.75.47m13.5 0c1.01.143 2.01.317 3 .52m-3-.52 2.62 10.726c.122.499-.106 1.028-.589 1.202a5.988 5.988 0 0 1-2.031.352 5.988 5.988 0 0 1-2.031-.352c-.483-.174-.711-.703-.59-1.202L18.75 4.971Zm-16.5.52c.99-.203 1.99-.377 3-.52m0 0 2.62 10.726c.122.499-.106 1.028-.589 1.202a5.989 5.989 0 0 1-2.031.352 5.989 5.989 0 0 1-2.031-.352c-.483-.174-.711-.703-.59-1.202L5.25 4.971Z" />
                </svg>
            ),
        },
        {
            href: "/admin/course",
            label: "Course",
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
                </svg>
            ),
        },
        {
            href: "/admin/url",
            label: "URL",
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m13.35-.622 1.757-1.757a4.5 4.5 0 0 0-6.364-6.364l-4.5 4.5a4.5 4.5 0 0 0 1.242 7.244" />
                </svg>
            ),
        },
        {
            href: "/admin/faqs",
            label: "FAQS",
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 5.25h.008v.008H12v-.008Z" />
                </svg>
            ),
        },
        {
            href: "/admin/users",
            label: "Administrators",
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z" />
                </svg>
            ),
        },
    ]

    const steps = [
        { id: 1, label: "Analyzing" },
        { id: 2, label: "Chunking" },
        { id: 3, label: "Scraping" },
        { id: 4, label: "Completed" }
    ]

    const getStepIndex = (stepLabel) => {
        return steps.findIndex(s => s.label === stepLabel) + 1
    }

    const currentStepIndex = getStepIndex(syncProgress.step)

    return (
        <main className="text-gray-600">
            {/* Progress Modal */}
            {isSyncing && (
                <div className="fixed inset-0 z-[60] flex items-start justify-center p-4">
                    <div className="relative w-full max-w-2xl bg-white rounded-sm border border-gray-300 shadow-sm overflow-hidden">
                        <button
                            onClick={closeProgressModal}
                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                            </svg>
                        </button>

                        <div className="p-6">
                            <h2 className="text-lg font-bold text-[#205781] mb-6 text-center">Applying Knowledge Base Changes</h2>
                            <ol className="flex flex-col sm:flex-row items-center w-full p-3 space-y-4 sm:space-y-0 sm:space-x-4 text-sm font-medium text-center text-gray-600 rounded-lg border border-gray-100 bg-gray-50/50">
                                {steps.map((step, idx) => {
                                    const isCompleted = currentStepIndex > step.id || (syncProgress.status === "completed" && step.id === 4)
                                    const isActive = currentStepIndex === step.id && syncProgress.status === "running"
                                    const isLast = idx === steps.length - 1

                                    return (
                                        <li key={step.id} className={`flex items-center ${isCompleted ? "text-green-600" : isActive ? "text-[#205781]" : "text-gray-400"} flex-1 justify-center`}>
                                            <span className={`flex items-center justify-center w-6 h-6 me-2 text-xs border rounded-full shrink-0 ${isCompleted ? "border-green-600 bg-green-50" : isActive ? "border-[#205781] bg-[#205781]/10" : "border-gray-300"}`}>
                                                {isCompleted ? (
                                                    <svg className="w-3.5 h-3.5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 16 12"><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M1 5.917 5.724 10.5 15 1.5" /></svg>
                                                ) : step.id}
                                            </span>
                                            <span className="font-semibold">{step.label}</span>
                                            {!isLast && (
                                                <svg className="hidden sm:block w-3 h-3 ms-2 sm:ms-4 rtl:rotate-180 text-gray-300" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 12 10"><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m7 9 4-4-4-4M1 9l4-4-4-4" /></svg>
                                            )}
                                        </li>
                                    )
                                })}
                            </ol>

                            {syncProgress.status === "error" && (
                                <p className="mt-4 text-center text-sm text-red-600 font-medium">An error occurred while applying changes. Please try again.</p>
                            )}
                            {syncProgress.status === "completed" && (
                                <p className="mt-4 text-center text-sm text-green-600 font-medium">Changes applied successfully!</p>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Top Navigation Bar */}
            <nav className="fixed top-0 z-50 w-full bg-white border-b border-gray-300">
                <div className="px-4 py-2 lg:px-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => setIsMenuActive(!isMenuActive)}
                                className="inline-flex items-center justify-center p-2.5 rounded-lg text-gray-600 hover:bg-gray-50 focus:outline-none sm:hidden transition-all duration-200"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                                </svg>
                            </button>

                            <div className="flex items-center gap-3">
                                <img src="/favicon.ico" className="h-8 sm:h-10" alt="Logo" />
                                <span className="text-lg sm:text-xl font-bold text-[#205781]">TLC ChatMate</span>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            {/* Apply Changes Button - Desktop */}
                            <button
                                onClick={handleApplyChanges}
                                disabled={!hasUpdates || isSyncing}
                                className={`hidden sm:flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${hasUpdates && !isSyncing
                                    ? "bg-amber-500 text-white hover:bg-amber-600 shadow-md hover:shadow-lg"
                                    : "bg-gray-100 text-gray-400 cursor-not-allowed"
                                    }`}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={`w-4 h-4 ${isSyncing ? "animate-spin" : ""}`}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
                                </svg>
                                Apply Changes
                            </button>

                            <div className="relative">
                                <button type="button" onClick={() => setDropdownOpen(!dropdownOpen)} className="flex items-center gap-2 p-1.5 rounded-full hover:bg-gray-50 focus:outline-none transition-all duration-200">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5ZM12 12.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5ZM12 18.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5Z" />
                                    </svg>
                                </button>

                                {dropdownOpen && (
                                    <div className="absolute top-full right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
                                        <div className="p-4 border-b border-gray-100">
                                            <p className="text-sm font-semibold text-gray-900 truncate">
                                                {userData?.user_name || "Guest"}
                                            </p>
                                        </div>
                                        <div className="py-2">
                                            <Link
                                                href="/student/faqs"
                                                className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-150"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 0 1 .865-.501 48.172 48.172 0 0 0 3.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z" />
                                                </svg>
                                                ChatMate
                                            </Link>

                                            <button
                                                onClick={() => {
                                                    localStorage.removeItem("userData")
                                                    router.push("/")
                                                }}
                                                className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors duration-150"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9" />
                                                </svg>
                                                Log out
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Sidebar */}
            {userData && (
                <aside
                    className={`fixed top-0 left-0 z-40 w-64 h-screen pt-20 transition-transform duration-300 ease-in-out bg-[#205781] ${isMenuActive ? "translate-x-0" : "-translate-x-full"
                        } sm:translate-x-0`}
                >
                    <div className="h-full px-4 py-6 flex flex-col">
                        <div className="mb-6 p-4 rounded-xl bg-white/10 backdrop-blur-sm">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center text-white">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                                    </svg>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold text-white truncate">{userData?.user_name || "Guest"}</p>
                                    <p className="text-xs text-white/70 truncate">Admin</p>
                                </div>
                            </div>
                        </div>

                        {/* Apply Changes Button - Mobile (Only show in vertical sidebar if screen is small) */}
                        <div className="sm:hidden mb-4">
                            <button
                                onClick={handleApplyChanges}
                                disabled={!hasUpdates || isSyncing}
                                className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-sm font-bold transition-all duration-200 ${hasUpdates && !isSyncing
                                    ? "bg-amber-500 text-white shadow-lg"
                                    : "bg-white/10 text-white/40 cursor-not-allowed"
                                    }`}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={`w-5 h-5 ${isSyncing ? "animate-spin" : ""}`}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
                                </svg>
                                Apply Changes
                            </button>
                        </div>

                        <nav className="space-y-2 flex-1">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className={`flex items-center gap-3 px-4 py-3 rounded-sm transition-all duration-200 ${get_current_page === link.href
                                        ? "bg-white/10 text-white font-medium"
                                        : "text-white/80 hover:bg-white/10 hover:text-white"
                                        }`}
                                >
                                    {link.icon}
                                    <span className="text-sm">{link.label}</span>
                                </Link>
                            ))}
                        </nav>
                    </div>
                </aside>
            )}

            {isMenuActive && (
                <div
                    className="fixed inset-0 bg-black/20 z-30 sm:hidden"
                    onClick={() => setIsMenuActive(false)}
                />
            )}
        </main>
    )
}