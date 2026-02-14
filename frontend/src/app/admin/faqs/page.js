"use client"
import Navigation from "../navigation"
import { useState, useEffect, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import Create from "./create"
import Update from "./update"
import Success from '../success'
import Remove from '../remove'
import Pagination from '../Pagination';

function FaqsContent() {
    const [departments, setDepartments] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [searchData, setSearchData] = useState("")
    const [sortOption, setSortOption] = useState("")
    const [currentPage, setCurrentPage] = useState(1);
    const resultsPerPage = 10;
    const [createModal, setCreateModal] = useState(false)
    const [updateModal, setUpdateModal] = useState(false)
    const [selectedDepartment, setSelectedDepartment] = useState(null)
    const [successModal, setSuccessModal] = useState({ isOpen: false, message: '', body: '' });
    const [hasChanges, setHasChanges] = useState(false);
    const searchParams = useSearchParams()

    useEffect(() => {
        fetchDepartments()
    }, [])

    const fetchDepartments = async () => {
        setLoading(true)
        try {
            const response = await fetch("/api/admin/departments")
            if (!response.ok) throw new Error("Failed to fetch departments")
            const data = await response.json()
            if (data.success) {
                setDepartments(data.data)
                setError(null)
            } else {
                throw new Error(data.message || "Failed to fetch departments")
            }
        } catch (err) {
            console.error(err)
            setError(err.message)
            setDepartments([])
        } finally {
            setLoading(false)
        }
    }

    const showSuccess = (message, body = "") => {
        setSuccessModal({ isOpen: true, message, body });
    };

    const search = (e) => {
        setSearchData(e.target.value)
    }

    const filteredData = departments.filter((row) => {
        const deptName = row.department_name ? String(row.department_name).toLowerCase() : ""
        const deptId = row.department_id ? String(row.department_id) : ""
        const searchLower = searchData.toLowerCase()
        return (deptName.includes(searchLower) || deptId.includes(searchLower))
    })

    const sortedData = [...filteredData].sort((a, b) => {
        let aValue, bValue
        switch (sortOption) {
            case "Department Ascending":
                aValue = a.department_name || ""
                bValue = b.department_name || ""
                return aValue.localeCompare(bValue)
            case "Department Descending":
                aValue = a.department_name || ""
                bValue = b.department_name || ""
                return bValue.localeCompare(aValue)
            case "ID Ascending":
                aValue = a.department_id || 0
                bValue = b.department_id || 0
                return aValue - bValue
            case "ID Descending":
                aValue = a.department_id || 0
                bValue = b.department_id || 0
                return bValue - aValue
            default:
                return 0
        }
    })

    const totalPages = Math.ceil(sortedData.length / resultsPerPage);
    const paginatedData = sortedData.slice((currentPage - 1) * resultsPerPage, currentPage * resultsPerPage);

    const GhostButton = ({ children, onClick, className = "" }) => (
        <button
            type="button"
            onClick={onClick}
            className={`text-gray-600 bg-transparent box-border border border-transparent hover:bg-gray-100 focus:ring-4 focus:ring-gray-100 font-medium leading-5 rounded-sm text-sm px-4 py-2.5 focus:outline-none transition-all ${className}`}
        >
            {children}
        </button>
    );

    const openUpdateModal = (department) => {
        setSelectedDepartment(department)
        setUpdateModal(true)
        setHasChanges(false)
    }

    const closeUpdateModal = () => {
        setUpdateModal(false)
        setSelectedDepartment(null)
        setHasChanges(false)
    }

    const handleUpdateSuccess = () => {
        fetchDepartments()
        showSuccess("Updated!", "FAQ has been updated successfully.");
        setUpdateModal(false)
        setHasChanges(false)
    }

    const handleCreateSuccess = () => {
        fetchDepartments()
        showSuccess("Created!", "New department has been created.");
        setCreateModal(false)
    }

    return (
        <main className="min-h-screen bg-white">
            <Navigation />
            <div className="pt-16 sm:pt-15 sm:pl-64">
                <div className="p-4 sm:p-6 lg:p-8">
                    <div className="max-w-7xl mx-auto">
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
                            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">FAQs</h1>
                            <GhostButton className="bg-white text-gray-600 hover:bg-[#1a4a6b] flex items-center justify-center gap-2 w-fit sm:w-auto" onClick={() => setCreateModal(true)}>
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
                                <span>Add FAQ</span>
                            </GhostButton>
                        </div>
                        <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-sm border border-gray-200 h-[73vh] flex flex-col overflow-hidden">
                            {!createModal && (
                                <div className="p-4 sm:p-6 border-b border-gray-200 sticky top-0 z-10 bg-white/90 backdrop-blur-sm">
                                    <div className="flex flex-col sm:flex-row gap-4">
                                        <div className="flex-1">
                                            <label htmlFor="table-search" className="sr-only">Search</label>
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                                    <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z" /></svg>
                                                </div>
                                                <input type="text" id="table-search" className="w-full h-11 pl-10 pr-4 text-sm text-gray-600 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#205781]/20 focus:border-[#205781] transition-all duration-200" placeholder="Search by department name" value={searchData} onChange={search} />
                                            </div>
                                        </div>
                                        <div className="sm:w-48">
                                            <label htmlFor="sort-option" className="sr-only">Sort by</label>
                                            <select id="sort-option" className="w-full h-11 px-4 text-sm text-gray-600 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#205781]/20 focus:border-[#205781] transition-all duration-200" value={sortOption} onChange={(e) => setSortOption(e.target.value)}>
                                                <option value="">Sort by</option>
                                                <option value="Department Ascending">Department (A-Z)</option>
                                                <option value="Department Descending">Department (Z-A)</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            )}
                            <div className="flex-1 overflow-x-auto overflow-y-auto">
                                {loading ? (
                                    <div className="flex flex-col justify-center items-center py-16">
                                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#205781]"></div>
                                        <p className="mt-4 text-sm text-gray-500">Loading departments...</p>
                                    </div>
                                ) : error ? (
                                    <div className="flex flex-col justify-center items-center py-16 px-4">
                                        <svg className="w-12 h-12 text-red-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                        <p className="text-red-600 text-center">Error loading departments: {error}</p>
                                    </div>
                                ) : sortedData.length === 0 ? (
                                    <div className="flex flex-col justify-center items-center py-16">
                                        <svg className="w-12 h-12 text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414A1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" /></svg>
                                        <p className="text-gray-500 text-center">{searchData ? "No matching departments found" : "No departments available"}</p>
                                    </div>
                                ) : (
                                    <div className="min-w-full">
                                        {/* Desktop Table View */}
                                        <div className="hidden md:block">
                                            <table className="w-full text-sm text-left">
                                                <thead className="text-xs font-semibold text-white uppercase bg-[#205781] sticky top-0 z-10">
                                                    <tr>
                                                        <th scope="col" className="px-6 py-4">Department Name</th>
                                                        <th scope="col" className="px-6 py-4 text-center">Actions</th>
                                                        <th scope="col" className="px-6 py-4 text-center"></th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-gray-200">
                                                    {paginatedData.map((dept) => (
                                                        <tr key={dept.department_id} className="bg-white hover:bg-gray-50 transition-colors duration-150">
                                                            <td className="px-6 py-4 text-gray-800 font-medium">{dept.department_name}</td>
                                                            <td className="px-6 py-4">
                                                                <div className="flex items-center justify-center gap-3">
                                                                    <button className="p-2 text-[#205781] hover:bg-[#205781]/10 rounded-lg transition-all duration-150" onClick={() => openUpdateModal(dept)} aria-label="Update FAQ">
                                                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" /></svg>
                                                                    </button>
                                                                </div>
                                                            </td>
                                                            <td className="px-6 py-4">
                                                                <div className="flex items-center justify-center gap-3">
                                                                    <Remove
                                                                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all duration-150"
                                                                        id={{ department_id: dept.department_id }}
                                                                        name={dept.department_name}
                                                                        apiroute="/api/admin/departments"
                                                                        onSuccess={() => { fetchDepartments(); showSuccess("Deleted!", "Department and all associated FAQs have been removed."); }}
                                                                        message="Are you sure you want to delete this department? This will automatically delete all FAQs in this department."
                                                                    />
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>

                                        {/* Mobile Card View */}
                                        <div className="md:hidden divide-y divide-gray-200">
                                            {paginatedData.map((dept) => (
                                                <div key={dept.department_id} className="p-4 bg-white hover:bg-gray-50 transition-colors duration-150">
                                                    <div className="flex items-start justify-between mb-3">
                                                        <div className="flex-1 min-w-0">
                                                            <h3 className="text-base font-semibold text-gray-800 truncate">{dept.department_name}</h3>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-[#205781] bg-[#205781]/5 hover:bg-[#205781]/10 rounded-lg transition-all duration-150" onClick={() => openUpdateModal(dept)}>
                                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" /></svg>
                                                            <span>Edit</span>
                                                        </button>
                                                        <Remove
                                                            id={{ department_id: dept.department_id }}
                                                            name={dept.department_name}
                                                            apiroute="/api/admin/departments"
                                                            onSuccess={() => { fetchDepartments(); showSuccess("Deleted!", "Department and all associated FAQs have been removed."); }}
                                                            message="Are you sure you want to delete this department? This will automatically delete all FAQs in this department."
                                                            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-all duration-150"
                                                        >
                                                            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                                            <span>Delete</span>
                                                        </Remove>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                            <Pagination
                                currentPage={currentPage}
                                totalPages={totalPages}
                                totalResults={sortedData.length}
                                resultsPerPage={resultsPerPage}
                                onPageChange={setCurrentPage}
                            />
                        </div>
                    </div>
                </div>
            </div>
            <Create open={createModal} close={() => setCreateModal(false)} onSuccess={handleCreateSuccess} />
            <Update open={updateModal} close={closeUpdateModal} selectedFaqRow={selectedDepartment} onChanges={(changed) => setHasChanges(changed)} onSuccess={handleUpdateSuccess} />
            <Success
                isOpen={successModal.isOpen}
                onClose={() => setSuccessModal({ ...successModal, isOpen: false })}
                message={successModal.message}
                body={successModal.body}
            />
        </main>
    )
}

export default function Faqs() {
    return (
        <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#205781]"></div></div>}>
            <FaqsContent />
        </Suspense>
    )
}