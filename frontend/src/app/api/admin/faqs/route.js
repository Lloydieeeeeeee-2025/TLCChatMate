// app/api/admin/faqs/route.js
import { chatmate } from "../../../../../library/tlcchatmatedb/route";

export async function GET(request) {
    try {
        const [faqs] = await chatmate.execute(
            "SELECT faq_id, question FROM faqs ORDER BY faq_id DESC"
        );

        const truncatedFaqs = faqs.map(faq => ({
            ...faq,
            question: faq.question.length > 100 ? faq.question.substring(0, 100) + '...' : faq.question
        }));

        return Response.json({
            success: true,
            data: truncatedFaqs
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
    try {
        const { question } = await request.json();

        // Validate input
        if (!question || question.trim() === "") {
            return Response.json(
                { success: false, message: "Question is required" },
                { status: 400 }
            );
        }

        if (question.length > 100) {
            return Response.json(
                { success: false, message: "Question must be 100 characters or less" },
                { status: 400 }
            );
        }

        const trimmedQuestion = question.trim();

        // Check if question already exists
        const [existing] = await chatmate.execute(
            "SELECT faq_id FROM faqs WHERE question = ?",
            [trimmedQuestion]
        );

        if (existing.length > 0) {
            return Response.json(
                { success: false, message: "Question already exists" },
                { status: 409 }
            );
        }

        // Insert new FAQ
        const [result] = await chatmate.execute(
            "INSERT INTO faqs (question) VALUES (?)",
            [trimmedQuestion]
        );

        return Response.json({
            success: true,
            message: "FAQ created successfully",
            data: { faq_id: result.insertId, question: trimmedQuestion }
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
    try {
        const { faq_id, question } = await request.json();

        if (!faq_id || !question || question.trim() === "") {
            return Response.json(
                { success: false, message: "FAQ ID and question are required" },
                { status: 400 }
            );
        }

        if (question.length > 100) {
            return Response.json(
                { success: false, message: "Question must be 100 characters or less" },
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
            "SELECT faq_id FROM faqs WHERE question = ? AND faq_id != ?",
            [trimmedQuestion, faq_id]
        );

        if (duplicate.length > 0) {
            return Response.json(
                { success: false, message: "Question already exists" },
                { status: 409 }
            );
        }

        // Update FAQ
        await chatmate.execute(
            "UPDATE faqs SET question = ? WHERE faq_id = ?",
            [trimmedQuestion, faq_id]
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
    try {
        const { faq_id, id } = await request.json(); // ✅ Accept both fields

        // Use faq_id if provided, otherwise fall back to id
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