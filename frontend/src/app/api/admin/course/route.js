// api/admin/course/route.js
// FIXED VERSION - WITH COMPREHENSIVE DEBUGGING LOGS

import { chatmate } from "../../../../../library/tlcchatmatedb/route";
import { NextResponse } from "next/server";

export async function POST(req) {
    try {
        console.log("\n" + "=".repeat(60));
        console.log("📥 [POST /api/admin/course] Starting course upload...");
        console.log("=".repeat(60));
        
        const formData = await req.formData();
        const courseDocument = formData.get("course_document");
        const documentName = formData.get("document_name");

        console.log("📋 [POST] Form data received:", {
            documentName: documentName,
            documentSize: courseDocument?.size || 0,
            documentType: courseDocument?.type || "unknown",
            hasDocument: !!courseDocument
        });

        if (!courseDocument || !documentName) {
            console.warn("⚠️  [POST] Missing required fields");
            console.warn("   - courseDocument:", !!courseDocument);
            console.warn("   - documentName:", documentName);
            return NextResponse.json(
                { success: false, message: "Course document and name are required" },
                { status: 400 }
            );
        }

        console.log(`📦 [POST] Document size: ${(courseDocument.size / 1024).toFixed(2)}KB`);
        console.log("🔄 [POST] Converting document to base64...");
        
        const bytes = await courseDocument.arrayBuffer();
        console.log("📊 [POST] ArrayBuffer created, size:", bytes.byteLength);
        
        const buffer = Buffer.from(bytes);
        console.log("📊 [POST] Node Buffer created, length:", buffer.length);
        
        const base64Document = buffer.toString("base64");

        console.log("✅ [POST] Base64 conversion successful");
        console.log("   - Base64 length:", base64Document.length);
        console.log("   - First 50 chars:", base64Document.substring(0, 50) + "...");

        const query = "INSERT INTO Course (course_document, document_name) VALUES (?, ?)";
        console.log("🗄️  [POST] Preparing database query...");
        console.log("   - Query:", query);
        console.log("   - documentName:", documentName);
        console.log("   - base64Document length:", base64Document.length);
        
        console.log("🔗 [POST] Executing database query...");
        const [result] = await chatmate.query(query, [base64Document, documentName]);

        console.log("✨ [POST] Course uploaded successfully!");
        console.log("   - Insert ID:", result.insertId);
        console.log("   - Affected rows:", result.affectedRows);

        return NextResponse.json(
            { success: true, message: "Course uploaded successfully", data: { course_id: result.insertId } },
            { status: 201 }
        );
    } catch (err) {
        console.error("\n" + "❌".repeat(30));
        console.error("❌ [POST] Error uploading course");
        console.error("   - Message:", err.message);
        console.error("   - Code:", err.code);
        console.error("   - Stack:", err.stack);
        console.error("❌".repeat(30) + "\n");
        
        return NextResponse.json({ success: false, message: "Failed to upload course" }, { status: 500 });
    }
}

export async function GET(req) {
    try {
        console.log("\n" + "=".repeat(60));
        console.log("📤 [GET /api/admin/course] Fetching courses...");
        console.log("=".repeat(60));
        
        const { searchParams } = new URL(req.url);
        const courseId = searchParams.get("course_id");
        const view = searchParams.get("view");

        console.log("📋 [GET] Query parameters:");
        console.log("   - courseId:", courseId);
        console.log("   - view:", view || "active (default)");

        if (courseId) {
            console.log(`🔍 [GET] Fetching single course with ID: ${courseId}`);
            
            const query = "SELECT * FROM Course WHERE course_id = ?";
            console.log("🗄️  [GET] Query:", query);
            
            const [result] = await chatmate.query(query, [courseId]);
            
            console.log("📊 [GET] Query result rows:", result.length);

            if (result.length === 0) {
                console.warn(`⚠️  [GET] Course not found with ID: ${courseId}`);
                return NextResponse.json(
                    { success: false, message: "Course not found" },
                    { status: 404 }
                );
            }

            let course = result[0];
            console.log("📖 [GET] Course found:");
            console.log("   - course_id:", course.course_id);
            console.log("   - document_name:", course.document_name);
            console.log("   - document type:", typeof course.course_document);
            console.log("   - document size:", course.course_document?.length || 0);

            if (course.course_document) {
                console.log("🔄 [GET] Converting document to UTF-8...");
                course.course_document = course.course_document.toString("utf8");
                console.log("✅ [GET] Conversion complete");
            }

            console.log("✨ [GET] Successfully retrieved single course");
            return NextResponse.json({ success: true, data: course }, { status: 200 });
        }

        let query;
        if (view === "archived") {
            query = "SELECT course_id, document_name, deleted_at FROM Course WHERE deleted_at IS NOT NULL ORDER BY deleted_at DESC";
            console.log("📚 [GET] Fetching ARCHIVED courses");
        } else {
            query = "SELECT course_id, document_name FROM Course WHERE deleted_at IS NULL";
            console.log("📚 [GET] Fetching ACTIVE courses");
        }

        console.log("🗄️  [GET] Query:", query);
        console.log("🔗 [GET] Executing database query...");

        const [courses] = await chatmate.query(query);

        console.log(`✅ [GET] Query successful, returned ${courses.length} courses`);
        courses.forEach((c, i) => {
            console.log(`   [${i + 1}] ID: ${c.course_id}, Name: ${c.document_name}`);
        });

        console.log("✨ [GET] Successfully retrieved course list");
        return NextResponse.json({ success: true, data: courses }, { status: 200 });
    } catch (err) {
        console.error("\n" + "❌".repeat(30));
        console.error("❌ [GET] Error fetching courses");
        console.error("   - Message:", err.message);
        console.error("   - Code:", err.code);
        console.error("   - Stack:", err.stack);
        console.error("❌".repeat(30) + "\n");
        
        return NextResponse.json({ success: false, message: "Failed to fetch courses" }, { status: 500 });
    }
}

export async function PUT(req) {
    try {
        console.log("\n" + "=".repeat(60));
        console.log("✏️  [PUT /api/admin/course] Updating course...");
        console.log("=".repeat(60));

        const formData = await req.formData();
        const courseId = formData.get("course_id");
        const courseDocument = formData.get("course_document");
        const documentName = formData.get("document_name");

        console.log("📋 [PUT] Form data received:");
        console.log("   - courseId:", courseId);
        console.log("   - documentName:", documentName);
        console.log("   - has new document:", !!courseDocument);
        if (courseDocument) {
            console.log("   - document size:", (courseDocument.size / 1024).toFixed(2) + "KB");
        }

        if (!courseId || !documentName) {
            console.warn("⚠️  [PUT] Missing required fields");
            return NextResponse.json(
                { success: false, message: "Course ID and document name are required" },
                { status: 400 }
            );
        }

        let query, params;
        if (courseDocument) {
            console.log("🔄 [PUT] Document update detected");
            console.log("📦 [PUT] Converting new document to base64...");
            
            const bytes = await courseDocument.arrayBuffer();
            const buffer = Buffer.from(bytes);
            const base64Document = buffer.toString("base64");
            
            console.log("✅ [PUT] Base64 conversion successful");
            console.log("   - Base64 length:", base64Document.length);

            query = "UPDATE Course SET course_document = ?, document_name = ? WHERE course_id = ?";
            params = [base64Document, documentName, courseId];
            console.log("🗄️  [PUT] Preparing UPDATE query with document");
        } else {
            query = "UPDATE Course SET document_name = ? WHERE course_id = ?";
            params = [documentName, courseId];
            console.log("🗄️  [PUT] Preparing UPDATE query (name only)");
        }

        console.log("   - Query:", query);
        console.log("   - courseId:", courseId);

        console.log("🔗 [PUT] Executing database query...");
        const [updateResult] = await chatmate.query(query, params);

        console.log("✅ [PUT] Update successful");
        console.log("   - Affected rows:", updateResult.affectedRows);

        console.log("✨ [PUT] Course updated successfully");
        return NextResponse.json({ success: true, message: "Course updated successfully" }, { status: 200 });
    } catch (err) {
        console.error("\n" + "❌".repeat(30));
        console.error("❌ [PUT] Error updating course");
        console.error("   - Message:", err.message);
        console.error("   - Stack:", err.stack);
        console.error("❌".repeat(30) + "\n");
        
        return NextResponse.json({ success: false, message: "Failed to update course" }, { status: 500 });
    }
}

// Soft-delete (archive/unarchive)
export async function PATCH(req) {
    try {
        console.log("\n" + "=".repeat(60));
        console.log("📌 [PATCH /api/admin/course] Archive/Unarchive course...");
        console.log("=".repeat(60));

        const { course_id, action } = await req.json();

        console.log("📋 [PATCH] Request body:");
        console.log("   - course_id:", course_id);
        console.log("   - action:", action);

        if (!course_id || !["archive", "unarchive"].includes(action)) {
            console.warn("⚠️  [PATCH] Invalid request parameters");
            return NextResponse.json({ success: false, message: "Invalid request" }, { status: 400 });
        }

        let query;
        if (action === "archive") {
            query = "UPDATE Course SET deleted_at = NOW() WHERE course_id = ?";
            console.log("🗄️  [PATCH] Archiving course...");
        } else {
            query = "UPDATE Course SET deleted_at = NULL WHERE course_id = ?";
            console.log("🗄️  [PATCH] Unarchiving course...");
        }

        console.log("   - Query:", query);
        console.log("   - ID:", course_id);

        console.log("🔗 [PATCH] Executing database query...");
        const [result] = await chatmate.query(query, [course_id]);

        console.log("✅ [PATCH] Query successful");
        console.log("   - Affected rows:", result.affectedRows);

        if (result.affectedRows === 0) {
            console.warn(`⚠️  [PATCH] Course not found with ID: ${course_id}`);
            return NextResponse.json(
                { success: false, message: "Course not found" },
                { status: 404 }
            );
        }

        const message = action === "archive" ? "Course archived" : "Course restored";
        console.log("✨ [PATCH]", message);
        return NextResponse.json({ success: true, message }, { status: 200 });
    } catch (err) {
        console.error("\n" + "❌".repeat(30));
        console.error("❌ [PATCH] Archive/Unarchive error");
        console.error("   - Message:", err.message);
        console.error("   - Stack:", err.stack);
        console.error("❌".repeat(30) + "\n");
        
        return NextResponse.json({ success: false, message: "Operation failed" }, { status: 500 });
    }
}

// Hard delete (keep this!)
export async function DELETE(req) {
    try {
        console.log("\n" + "=".repeat(60));
        console.log("🗑️  [DELETE /api/admin/course] Deleting course...");
        console.log("=".repeat(60));

        const { searchParams } = new URL(req.url);
        const courseId = searchParams.get("course_id");

        console.log("📋 [DELETE] Query parameters:");
        console.log("   - courseId:", courseId);

        if (!courseId) {
            console.warn("⚠️  [DELETE] Missing course_id parameter");
            return NextResponse.json(
                { success: false, message: "Course ID is required" },
                { status: 400 }
            );
        }

        const query = "DELETE FROM Course WHERE course_id = ?";
        console.log("🗄️  [DELETE] Query:", query);
        console.log("   - ID:", courseId);

        console.log("🔗 [DELETE] Executing database query...");
        await chatmate.query(query, [courseId]);

        console.log("✨ [DELETE] Course deleted permanently");
        return NextResponse.json({ success: true, message: "Course deleted permanently" }, { status: 200 });
    } catch (err) {
        console.error("\n" + "❌".repeat(30));
        console.error("❌ [DELETE] Error deleting course");
        console.error("   - Message:", err.message);
        console.error("   - Stack:", err.stack);
        console.error("❌".repeat(30) + "\n");
        
        return NextResponse.json({ success: false, message: "Failed to delete course" }, { status: 500 });
    }
}