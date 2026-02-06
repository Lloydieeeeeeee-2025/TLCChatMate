// api/admin/handbook/route.js
// FIXED VERSION - Use .query() instead of .execute() and handle buffers as base64
// WITH COMPREHENSIVE DEBUGGING LOGS

import { chatmate } from "../../../../../library/tlcchatmatedb/route";
import { NextResponse } from "next/server";

export const runtime = 'nodejs';
export const maxDuration = 60;

async function parseFormData(req) {
  try {
    console.log("🔧 [parseFormData] Parsing incoming request form data...");
    const formData = await req.formData();
    console.log("✅ [parseFormData] Form data parsed successfully");
    return formData;
  } catch (err) {
    console.error("❌ [parseFormData] Error parsing form data:", err.message);
    throw err;
  }
}

// POST: Upload new handbook
export async function POST(req) {
  try {
    console.log("\n" + "=".repeat(60));
    console.log("📥 [POST /api/admin/handbook] Starting handbook upload...");
    console.log("=".repeat(60));
    
    const formData = await parseFormData(req);
    const handbookDocument = formData.get("handbook_document");
    const handbookName = formData.get("handbook_name");

    console.log("📋 [POST] Form data received:", {
      documentName: handbookName,
      documentSize: handbookDocument?.size || 0,
      documentType: handbookDocument?.type || "unknown",
      hasDocument: !!handbookDocument
    });

    if (!handbookDocument || !handbookName) {
      console.warn("⚠️  [POST] Missing required fields");
      console.warn("   - handbookDocument:", !!handbookDocument);
      console.warn("   - handbookName:", handbookName);
      return NextResponse.json(
        { success: false, message: "Handbook document and name are required" },
        { status: 400 }
      );
    }

    if (handbookDocument.size > 20 * 1024 * 1024) {
      console.warn(`⚠️  [POST] File size exceeded: ${(handbookDocument.size / 1024 / 1024).toFixed(2)}MB (max: 20MB)`);
      return NextResponse.json(
        { success: false, message: "File size must be less than 20MB" },
        { status: 400 }
      );
    }

    console.log(`📦 [POST] Document size: ${(handbookDocument.size / 1024).toFixed(2)}KB`);
    console.log("🔄 [POST] Converting document to base64...");
    
    const bytes = await handbookDocument.arrayBuffer();
    console.log("📊 [POST] ArrayBuffer created, size:", bytes.byteLength);
    
    const buffer = Buffer.from(bytes);
    console.log("📊 [POST] Node Buffer created, length:", buffer.length);
    
    // ✅ FIX: Convert to base64 string like course route does
    const base64Document = buffer.toString("base64");
    console.log("✅ [POST] Base64 conversion successful");
    console.log("   - Base64 length:", base64Document.length);
    console.log("   - First 50 chars:", base64Document.substring(0, 50) + "...");
    
    const query = "INSERT INTO Handbook (handbook_document, handbook_name) VALUES (?, ?)";
    console.log("🗄️  [POST] Preparing database query...");
    console.log("   - Query:", query);
    console.log("   - handbookName:", handbookName);
    console.log("   - base64Document length:", base64Document.length);
    
    // ✅ FIX: Changed from chatmate.execute() to chatmate.query()
    console.log("🔗 [POST] Connecting to database and executing query...");
    const [result] = await chatmate.query(query, [base64Document, handbookName]);

    console.log("✨ [POST] Handbook uploaded successfully!");
    console.log("   - Insert ID:", result.insertId);
    console.log("   - Affected rows:", result.affectedRows);
    
    return NextResponse.json(
      {
        success: true,
        message: "Handbook uploaded successfully",
        data: { handbook_id: result.insertId }
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("\n" + "❌".repeat(30));
    console.error("❌ [POST] Error uploading handbook");
    console.error("   - Message:", err.message);
    console.error("   - Code:", err.code);
    console.error("   - Stack:", err.stack);
    console.error("❌".repeat(30) + "\n");
    
    return NextResponse.json(
      { success: false, message: "Failed to upload handbook: " + err.message },
      { status: 500 }
    );
  }
}

// GET: Fetch handbooks (active or archived)
export async function GET(req) {
  try {
    console.log("\n" + "=".repeat(60));
    console.log("📤 [GET /api/admin/handbook] Fetching handbooks...");
    console.log("=".repeat(60));
    
    const { searchParams } = new URL(req.url);
    const handbookId = searchParams.get("handbook_id");
    const view = searchParams.get("view");

    console.log("📋 [GET] Query parameters:");
    console.log("   - handbookId:", handbookId);
    console.log("   - view:", view || "active (default)");

    if (handbookId) {
      console.log(`🔍 [GET] Fetching single handbook with ID: ${handbookId}`);
      
      const query = "SELECT * FROM Handbook WHERE handbook_id = ?";
      console.log("🗄️  [GET] Query:", query);
      
      // ✅ FIX: Changed from chatmate.execute() to chatmate.query()
      const [result] = await chatmate.query(query, [handbookId]);
      
      console.log("📊 [GET] Query result rows:", result.length);

      if (result.length === 0) {
        console.warn(`⚠️  [GET] Handbook not found with ID: ${handbookId}`);
        return NextResponse.json(
          { success: false, message: "Handbook not found" },
          { status: 404 }
        );
      }

      let handbook = result[0];
      console.log("📖 [GET] Handbook found:");
      console.log("   - handbook_id:", handbook.handbook_id);
      console.log("   - handbook_name:", handbook.handbook_name);
      console.log("   - document type:", typeof handbook.handbook_document);
      console.log("   - document size:", handbook.handbook_document?.length || 0);

      // ✅ FIX: If stored as base64, no conversion needed. If it's still a buffer, convert to base64
      if (handbook.handbook_document && typeof handbook.handbook_document !== 'string') {
        console.log("🔄 [GET] Converting buffer to base64...");
        handbook.handbook_document = handbook.handbook_document.toString('base64');
        console.log("✅ [GET] Conversion complete");
      } else {
        console.log("✅ [GET] Document already in base64 format");
      }

      console.log("✨ [GET] Successfully retrieved single handbook");
      return NextResponse.json({ success: true, data: handbook }, { status: 200 });
    }

    let query;
    if (view === "archived") {
      query = "SELECT handbook_id, handbook_name, deleted_at FROM Handbook WHERE deleted_at IS NOT NULL ORDER BY deleted_at DESC";
      console.log("📚 [GET] Fetching ARCHIVED handbooks");
    } else {
      query = "SELECT handbook_id, handbook_name FROM Handbook WHERE deleted_at IS NULL ORDER BY handbook_id DESC";
      console.log("📚 [GET] Fetching ACTIVE handbooks");
    }

    console.log("🗄️  [GET] Query:", query);
    console.log("🔗 [GET] Executing database query...");

    // ✅ FIX: Changed from chatmate.execute() to chatmate.query() and added empty array parameter
    const [handbooks] = await chatmate.query(query, []);

    console.log(`✅ [GET] Query successful, returned ${handbooks.length} handbooks`);
    handbooks.forEach((h, i) => {
      console.log(`   [${i + 1}] ID: ${h.handbook_id}, Name: ${h.handbook_name}`);
    });

    console.log("✨ [GET] Successfully retrieved handbook list");
    return NextResponse.json({ success: true, data: handbooks }, { status: 200 });
  } catch (err) {
    console.error("\n" + "❌".repeat(30));
    console.error("❌ [GET] Error fetching handbooks");
    console.error("   - Message:", err.message);
    console.error("   - Code:", err.code);
    console.error("   - Stack:", err.stack);
    console.error("❌".repeat(30) + "\n");
    
    return NextResponse.json(
      { success: false, message: "Failed to fetch handbooks" },
      { status: 500 }
    );
  }
}

// PUT: Update handbook
export async function PUT(req) {
  try {
    console.log("\n" + "=".repeat(60));
    console.log("✏️  [PUT /api/admin/handbook] Updating handbook...");
    console.log("=".repeat(60));

    const formData = await parseFormData(req);
    const handbookId = formData.get("handbook_id");
    const handbookDocument = formData.get("handbook_document");
    const handbookName = formData.get("handbook_name");

    console.log("📋 [PUT] Form data received:");
    console.log("   - handbookId:", handbookId);
    console.log("   - handbookName:", handbookName);
    console.log("   - has new document:", !!handbookDocument);
    if (handbookDocument) {
      console.log("   - document size:", (handbookDocument.size / 1024).toFixed(2) + "KB");
    }

    if (!handbookId || !handbookName) {
      console.warn("⚠️  [PUT] Missing required fields");
      return NextResponse.json(
        { success: false, message: "Handbook ID and name are required" },
        { status: 400 }
      );
    }

    let query, params;
    if (handbookDocument) {
      console.log("🔄 [PUT] Document update detected");
      
      if (handbookDocument.size > 20 * 1024 * 1024) {
        console.warn(`⚠️  [PUT] File size exceeded: ${(handbookDocument.size / 1024 / 1024).toFixed(2)}MB`);
        return NextResponse.json(
          { success: false, message: "File size must be less than 20MB" },
          { status: 400 }
        );
      }

      console.log("📦 [PUT] Converting new document to base64...");
      const bytes = await handbookDocument.arrayBuffer();
      const buffer = Buffer.from(bytes);
      // ✅ FIX: Convert to base64 string like course route does
      const base64Document = buffer.toString("base64");
      
      console.log("✅ [PUT] Base64 conversion successful");
      console.log("   - Base64 length:", base64Document.length);

      query = "UPDATE Handbook SET handbook_document = ?, handbook_name = ? WHERE handbook_id = ?";
      params = [base64Document, handbookName, handbookId];
      console.log("🗄️  [PUT] Preparing UPDATE query with document");
    } else {
      query = "UPDATE Handbook SET handbook_name = ? WHERE handbook_id = ?";
      params = [handbookName, handbookId];
      console.log("🗄️  [PUT] Preparing UPDATE query (name only)");
    }

    console.log("   - Query:", query);
    console.log("   - handbookName:", handbookName);
    console.log("   - handbookId:", handbookId);

    console.log("🔗 [PUT] Executing database query...");
    // ✅ FIX: Changed from chatmate.execute() to chatmate.query()
    const [updateResult] = await chatmate.query(query, params);

    console.log("✅ [PUT] Update successful");
    console.log("   - Affected rows:", updateResult.affectedRows);

    console.log("✨ [PUT] Handbook updated successfully");
    return NextResponse.json(
      { success: true, message: "Handbook updated successfully" },
      { status: 200 }
    );
  } catch (err) {
    console.error("\n" + "❌".repeat(30));
    console.error("❌ [PUT] Error updating handbook");
    console.error("   - Message:", err.message);
    console.error("   - Stack:", err.stack);
    console.error("❌".repeat(30) + "\n");
    
    return NextResponse.json(
      { success: false, message: "Failed to update handbook" },
      { status: 500 }
    );
  }
}

// PATCH: Archive or Unarchive
export async function PATCH(req) {
  try {
    console.log("\n" + "=".repeat(60));
    console.log("📌 [PATCH /api/admin/handbook] Archive/Unarchive handbook...");
    console.log("=".repeat(60));

    const { handbook_id, action } = await req.json();

    console.log("📋 [PATCH] Request body:");
    console.log("   - handbook_id:", handbook_id);
    console.log("   - action:", action);

    if (!handbook_id || !['archive', 'unarchive'].includes(action)) {
      console.warn("⚠️  [PATCH] Invalid request parameters");
      return NextResponse.json(
        { success: false, message: "Invalid request" },
        { status: 400 }
      );
    }

    let query;
    if (action === "archive") {
      query = "UPDATE Handbook SET deleted_at = NOW() WHERE handbook_id = ?";
      console.log("🗄️  [PATCH] Archiving handbook...");
    } else {
      query = "UPDATE Handbook SET deleted_at = NULL WHERE handbook_id = ?";
      console.log("🗄️  [PATCH] Unarchiving handbook...");
    }

    console.log("   - Query:", query);
    console.log("   - ID:", handbook_id);

    console.log("🔗 [PATCH] Executing database query...");
    // ✅ FIX: Changed from chatmate.execute() to chatmate.query()
    const [result] = await chatmate.query(query, [handbook_id]);

    console.log("✅ [PATCH] Query successful");
    console.log("   - Affected rows:", result.affectedRows);

    if (result.affectedRows === 0) {
      console.warn(`⚠️  [PATCH] Handbook not found with ID: ${handbook_id}`);
      return NextResponse.json(
        { success: false, message: "Handbook not found" },
        { status: 404 }
      );
    }

    const message = action === "archive" ? "Handbook archived" : "Handbook restored";
    console.log("✨ [PATCH]", message);
    return NextResponse.json({ success: true, message }, { status: 200 });
  } catch (err) {
    console.error("\n" + "❌".repeat(30));
    console.error("❌ [PATCH] Archive/Unarchive error");
    console.error("   - Message:", err.message);
    console.error("   - Stack:", err.stack);
    console.error("❌".repeat(30) + "\n");
    
    return NextResponse.json(
      { success: false, message: "Operation failed" },
      { status: 500 }
    );
  }
}

// DELETE: Hard delete (keep this!)
export async function DELETE(req) {
  try {
    console.log("\n" + "=".repeat(60));
    console.log("🗑️  [DELETE /api/admin/handbook] Deleting handbook...");
    console.log("=".repeat(60));

    const { searchParams } = new URL(req.url);
    const handbookId = searchParams.get("handbook_id");

    console.log("📋 [DELETE] Query parameters:");
    console.log("   - handbookId:", handbookId);

    if (!handbookId) {
      console.warn("⚠️  [DELETE] Missing handbook_id parameter");
      return NextResponse.json(
        { success: false, message: "Handbook ID is required" },
        { status: 400 }
      );
    }

    const query = "DELETE FROM Handbook WHERE handbook_id = ?";
    console.log("🗄️  [DELETE] Query:", query);
    console.log("   - ID:", handbookId);

    console.log("🔗 [DELETE] Executing database query...");
    // ✅ FIX: Changed from chatmate.execute() to chatmate.query()
    const deleteResult = await chatmate.query(query, [handbookId]);

    console.log("✅ [DELETE] Delete successful");
    console.log("   - Affected rows:", deleteResult[0].affectedRows);

    console.log("✨ [DELETE] Handbook deleted permanently");
    return NextResponse.json(
      { success: true, message: "Handbook deleted permanently" },
      { status: 200 }
    );
  } catch (err) {
    console.error("\n" + "❌".repeat(30));
    console.error("❌ [DELETE] Error deleting handbook");
    console.error("   - Message:", err.message);
    console.error("   - Stack:", err.stack);
    console.error("❌".repeat(30) + "\n");
    
    return NextResponse.json(
      { success: false, message: "Failed to delete handbook" },
      { status: 500 }
    );
  }
}