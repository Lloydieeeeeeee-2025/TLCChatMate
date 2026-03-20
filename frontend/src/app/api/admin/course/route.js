import { chatmate } from "../../../../../library/tlcchatmatedb/route";
import { NextResponse } from "next/server";
import { requireAdminSession } from "../../../../../library/auth/guard";

const MAX_FILE_SIZE_MB = 100;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

export async function POST(req) {
    const auth = await requireAdminSession();
    if (auth.error) return auth.error;
    try {
        const formData = await req.formData();
        const courseDocument = formData.get("course_document");
        const documentName = formData.get("document_name");

        if (!courseDocument || !documentName) {
            return NextResponse.json({ success: false, message: "Course document and name are required" }, { status: 400 });
        }

        if (courseDocument.size > MAX_FILE_SIZE_BYTES) {
            return NextResponse.json({ success: false, message: `File size must be less than ${MAX_FILE_SIZE_MB}MB` }, { status: 400 });
        }

        const bytes = await courseDocument.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const base64Document = buffer.toString("base64");

        const query = "INSERT INTO course (course_document, document_name) VALUES (?, ?)";
        const [result] = await chatmate.query(query, [base64Document, documentName]);

        return NextResponse.json({ success: true, message: "Course uploaded successfully", data: { course_id: result.insertId } }, { status: 201 });
    } catch (err) {
        console.error("Error uploading course:", err);

        // Handle max_allowed_packet error specifically
        if (err.code === 'ER_NET_PACKET_TOO_LARGE' || err.sqlMessage?.includes('max_allowed_packet')) {
            return NextResponse.json({
                success: false,
                message: "File is too large for the database. Please ensure MySQL max_allowed_packet is set to at least 256MB. Contact your system administrator."
            }, { status: 413 });
        }

        return NextResponse.json({ success: false, message: "Failed to upload course" }, { status: 500 });
    }
}

export async function GET(req) {
    const auth = await requireAdminSession();
    if (auth.error) return auth.error;
    try {
        const { searchParams } = new URL(req.url);
        const courseId = searchParams.get("course_id");
        const view = searchParams.get("view"); // 'active' or 'archived'

        if (courseId) {
            const query = "SELECT * FROM course WHERE course_id = ?";
            const [result] = await chatmate.query(query, [courseId]);
            if (result.length === 0) {
                return NextResponse.json({ success: false, message: "Course not found" }, { status: 404 });
            }
            let course = result[0];
            if (course.course_document) course.course_document = course.course_document.toString("utf8");
            return NextResponse.json({ success: true, data: course }, { status: 200 });
        }

        let query;
        if (view === "archived") {
            query = "SELECT course_id, document_name, archive_at FROM course WHERE archive_at IS NOT NULL ORDER BY archive_at DESC";
        } else {
            query = "SELECT course_id, document_name FROM course WHERE archive_at IS NULL";
        }

        const [courses] = await chatmate.query(query);
        return NextResponse.json({ success: true, data: courses }, { status: 200 });
    } catch (err) {
        console.error("Error fetching courses:", err);
        return NextResponse.json({ success: false, message: "Failed to fetch courses" }, { status: 500 });
    }
}

export async function PUT(req) {
    const auth = await requireAdminSession();
    if (auth.error) return auth.error;
    try {
        const formData = await req.formData();
        const courseId = formData.get("course_id");
        const courseDocument = formData.get("course_document");
        const documentName = formData.get("document_name");

        if (!courseId || !documentName) {
            return NextResponse.json({ success: false, message: "Course ID and document name are required" }, { status: 400 });
        }

        let query, params;
        if (courseDocument) {
            if (courseDocument.size > MAX_FILE_SIZE_BYTES) {
                return NextResponse.json({ success: false, message: `File size must be less than ${MAX_FILE_SIZE_MB}MB` }, { status: 400 });
            }
            const bytes = await courseDocument.arrayBuffer();
            const buffer = Buffer.from(bytes);
            const base64Document = buffer.toString("base64");
            query = "UPDATE course SET course_document = ?, document_name = ? WHERE course_id = ?";
            params = [base64Document, documentName, courseId];
        } else {
            query = "UPDATE course SET document_name = ? WHERE course_id = ?";
            params = [documentName, courseId];
        }

        const [updateResult] = await chatmate.query(query, params);
        return NextResponse.json({ success: true, message: "Course updated successfully" }, { status: 200 });
    } catch (err) {
        console.error("Error updating course:", err);

        // Handle max_allowed_packet error specifically
        if (err.code === 'ER_NET_PACKET_TOO_LARGE' || err.sqlMessage?.includes('max_allowed_packet')) {
            return NextResponse.json({
                success: false,
                message: "File is too large for the database. Please ensure MySQL max_allowed_packet is set to at least 256MB. Contact your system administrator."
            }, { status: 413 });
        }

        return NextResponse.json({ success: false, message: "Failed to update course" }, { status: 500 });
    }
}

// Soft-delete (archive/unarchive)
export async function PATCH(req) {
    const auth = await requireAdminSession();
    if (auth.error) return auth.error;
    try {
        const { course_id, action } = await req.json();

        if (!course_id || !["archive", "unarchive"].includes(action)) {
            return NextResponse.json({ success: false, message: "Invalid request" }, { status: 400 });
        }

        let query;
        if (action === "archive") {
            query = "UPDATE course SET archive_at = NOW() WHERE course_id = ?";
        } else {
            query = "UPDATE course SET archive_at = NULL WHERE course_id = ?";
        }

        const [result] = await chatmate.query(query, [course_id]);
        if (result.affectedRows === 0) {
            return NextResponse.json({ success: false, message: "Course not found" }, { status: 404 });
        }

        return NextResponse.json({ success: true, message: action === "archive" ? "Course archived" : "Course restored" }, { status: 200 });
    } catch (err) {
        console.error("Archive/Unarchive error:", err);
        return NextResponse.json({ success: false, message: "Operation failed" }, { status: 500 });
    }
}

// Hard delete (keep this!)
export async function DELETE(req) {
    const auth = await requireAdminSession();
    if (auth.error) return auth.error;
    try {
        const { searchParams } = new URL(req.url);
        let courseId = searchParams.get("course_id");

        if (!courseId) {
            try {
                const body = await req.json();
                courseId = body.course_id || body.id;
            } catch (e) {
                // Not JSON or empty
            }
        }

        if (!courseId) {
            return NextResponse.json({ success: false, message: "Course ID is required" }, { status: 400 });
        }
        const query = "DELETE FROM course WHERE course_id = ?";
        await chatmate.query(query, [courseId]);
        return NextResponse.json({ success: true, message: "Course deleted permanently" }, { status: 200 });
    } catch (err) {
        console.error("Error deleting course:", err);
        return NextResponse.json({ success: false, message: "Failed to delete course" }, { status: 500 });
    }
}