// app/api/admin/faqs/route.js
import { chatmate } from "../../../../../library/tlcchatmatedb/route";
import { requireAdminSession } from "../../../../../library/auth/guard";

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const departmentId = searchParams.get("department_id");

        let query = `SELECT 
                f.faq_id, 
                f.question, 
                f.department_id,
                d.department_name
            FROM faqs f
            LEFT JOIN departments d ON f.department_id = d.department_id`;

        let params = [];

        if (departmentId) {
            query += " WHERE f.department_id = ?";
            params.push(parseInt(departmentId));
        }

        query += " ORDER BY f.created_at DESC";

        const [faqs] = await chatmate.execute(query, params);

        // If requesting specific department, return flat list
        if (departmentId) {
            return Response.json({
                success: true,
                data: faqs
            });
        }

        // Otherwise return grouped by department
        const faqsByDepartment = {};
        faqs.forEach(faq => {
            const deptName = faq.department_name || "General";
            const deptId = faq.department_id || 0;

            if (!faqsByDepartment[deptId]) {
                faqsByDepartment[deptId] = {
                    department_id: deptId,
                    department_name: deptName,
                    faqs: []
                };
            }

            faqsByDepartment[deptId].faqs.push({
                faq_id: faq.faq_id,
                question: faq.question,
                full_question: faq.question
            });
        });

        const groupedData = Object.values(faqsByDepartment);

        return Response.json({
            success: true,
            data: groupedData
        });
    } catch (error) {
        console.error("Error fetching FAQs:", error);
        return Response.json(
            { success: false, message: "Failed to fetch FAQs" },
            { status: 500 }
        );
    }
}

export async function POST(request) {
    const auth = await requireAdminSession();
    if (auth.error) return auth.error;
    try {
        const { question, department_id } = await request.json();

        // Validate input
        if (!question || question.trim() === "") {
            return Response.json(
                { success: false, message: "Question is required" },
                { status: 400 }
            );
        }

        if (question.length > 500) {
            return Response.json(
                { success: false, message: "Question must be 500 characters or less" },
                { status: 400 }
            );
        }

        if (!department_id) {
            return Response.json(
                { success: false, message: "Department is required" },
                { status: 400 }
            );
        }

        const trimmedQuestion = question.trim();

        // Check if question already exists in the same department
        const [existing] = await chatmate.execute(
            "SELECT faq_id FROM faqs WHERE LOWER(question) = LOWER(?) AND department_id = ?",
            [trimmedQuestion, department_id]
        );

        if (existing.length > 0) {
            return Response.json(
                { success: false, message: "Question already exists in this department" },
                { status: 409 }
            );
        }

        // Insert new FAQ
        const [result] = await chatmate.execute(
            "INSERT INTO faqs (question, department_id) VALUES (?, ?)",
            [trimmedQuestion, department_id]
        );

        return Response.json({
            success: true,
            message: "FAQ created successfully",
            data: {
                faq_id: result.insertId,
                question: trimmedQuestion,
                department_id: department_id
            }
        });

    } catch (error) {
        console.error("Error creating FAQ:", error);
        return Response.json(
            { success: false, message: "Failed to create FAQ" },
            { status: 500 }
        );
    }
}

export async function PUT(request) {
    const auth = await requireAdminSession();
    if (auth.error) return auth.error;
    try {
        const { faq_id, question, department_id } = await request.json();

        if (!faq_id || !question || question.trim() === "") {
            return Response.json(
                { success: false, message: "FAQ ID and question are required" },
                { status: 400 }
            );
        }

        if (question.length > 500) {
            return Response.json(
                { success: false, message: "Question must be 500 characters or less" },
                { status: 400 }
            );
        }

        const trimmedQuestion = question.trim();

        // Check if FAQ exists
        const [existing] = await chatmate.execute(
            "SELECT faq_id FROM faqs WHERE faq_id = ?",
            [faq_id]
        );

        if (existing.length === 0) {
            return Response.json(
                { success: false, message: "FAQ not found" },
                { status: 404 }
            );
        }

        // Check for duplicate (excluding current)
        const [duplicate] = await chatmate.execute(
            "SELECT faq_id FROM faqs WHERE LOWER(question) = LOWER(?) AND faq_id != ? AND department_id = ?",
            [trimmedQuestion, faq_id, department_id]
        );

        if (duplicate.length > 0) {
            return Response.json(
                { success: false, message: "Question already exists" },
                { status: 409 }
            );
        }

        // Update FAQ
        await chatmate.execute(
            "UPDATE faqs SET question = ?, department_id = ? WHERE faq_id = ?",
            [trimmedQuestion, department_id, faq_id]
        );

        return Response.json({
            success: true,
            message: "FAQ updated successfully"
        });

    } catch (error) {
        console.error("Error updating FAQ:", error);
        return Response.json(
            { success: false, message: "Failed to update FAQ" },
            { status: 500 }
        );
    }
}

export async function DELETE(request) {
    const auth = await requireAdminSession();
    if (auth.error) return auth.error;
    try {
        const { faq_id, id } = await request.json();
        const targetId = faq_id || id;

        if (!targetId) {
            return Response.json(
                { success: false, message: "FAQ ID is required" },
                { status: 400 }
            );
        }

        // Check if FAQ exists
        const [existing] = await chatmate.execute(
            "SELECT faq_id FROM faqs WHERE faq_id = ?",
            [targetId]
        );

        if (existing.length === 0) {
            return Response.json(
                { success: false, message: "FAQ not found" },
                { status: 404 }
            );
        }

        // Delete FAQ
        await chatmate.execute(
            "DELETE FROM faqs WHERE faq_id = ?",
            [targetId]
        );

        return Response.json({
            success: true,
            message: "FAQ deleted successfully"
        });

    } catch (error) {
        console.error("Error deleting FAQ:", error);
        return Response.json(
            { success: false, message: "Failed to delete FAQ" },
            { status: 500 }
        );
    }
}