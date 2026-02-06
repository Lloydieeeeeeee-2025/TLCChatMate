// api/admin/url/route.js
// FIXED VERSION - Use .query() instead of .execute() with comprehensive debugging logs

import { NextResponse } from "next/server";
import { chatmate } from "../../../../../library/tlcchatmatedb/route";

export async function GET() {
    try {
        console.log("\n" + "=".repeat(60));
        console.log("📤 [GET /api/admin/url] Fetching all URLs...");
        console.log("=".repeat(60));

        console.log("🗄️  [GET] Query: SELECT * FROM URL ORDER BY url_id DESC");
        console.log("🔗 [GET] Executing database query...");

        // ✅ FIX: Changed from chatmate.execute() to chatmate.query()
        const [rows] = await chatmate.query("SELECT * FROM URL ORDER BY url_id DESC");

        console.log(`✅ [GET] Query successful, returned ${rows.length} URLs`);
        rows.slice(0, 5).forEach((row, i) => {
            console.log(`   [${i + 1}] ID: ${row.url_id}, URL: ${row.link_url}`);
        });
        if (rows.length > 5) {
            console.log(`   ... and ${rows.length - 5} more`);
        }

        console.log("✨ [GET] Successfully retrieved URL list");
        return NextResponse.json({ success: true, data: rows });
    } catch (error) {
        console.error("\n" + "❌".repeat(30));
        console.error("❌ [GET] Error fetching URLs");
        console.error("   - Message:", error.message);
        console.error("   - Code:", error.code);
        console.error("   - Stack:", error.stack);
        console.error("❌".repeat(30) + "\n");

        return NextResponse.json({ success: false, message: "Failed to fetch URLs" }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        console.log("\n" + "=".repeat(60));
        console.log("📥 [POST /api/admin/url] Creating new URL...");
        console.log("=".repeat(60));

        const { link_url, description } = await request.json();

        console.log("📋 [POST] Request body received:", {
            link_url: link_url,
            description: description?.substring(0, 50) + "..." || "null"
        });

        if (!link_url) {
            console.warn("⚠️  [POST] Missing required field: link_url");
            return NextResponse.json({ success: false, message: "URL is required" }, { status: 400 });
        }

        // Validate URL format
        console.log("✔️  [POST] Validating URL format...");
        try {
            new URL(link_url);
            console.log("✅ [POST] URL format is valid");
        } catch (err) {
            console.warn("⚠️  [POST] Invalid URL format:", link_url);
            return NextResponse.json({ success: false, message: "Invalid URL format" }, { status: 400 });
        }

        const query = "INSERT INTO URL (link_url, description) VALUES (?, ?)";
        console.log("🗄️  [POST] Query:", query);
        console.log("   - link_url:", link_url);
        console.log("   - description:", description || "null");

        console.log("🔗 [POST] Executing database query...");
        // ✅ FIX: Changed from chatmate.execute() to chatmate.query()
        const [result] = await chatmate.query(
            query,
            [link_url, description || null]
        );

        console.log("✨ [POST] URL created successfully!");
        console.log("   - Insert ID:", result.insertId);
        console.log("   - Affected rows:", result.affectedRows);

        return NextResponse.json({ success: true, data: { url_id: result.insertId } });
    } catch (error) {
        console.error("\n" + "❌".repeat(30));
        console.error("❌ [POST] Error creating URL");
        console.error("   - Message:", error.message);
        console.error("   - Code:", error.code);
        console.error("   - Stack:", error.stack);
        console.error("❌".repeat(30) + "\n");

        return NextResponse.json({ success: false, message: "Failed to create URL" }, { status: 500 });
    }
}

export async function PUT(request) {
    try {
        console.log("\n" + "=".repeat(60));
        console.log("✏️  [PUT /api/admin/url] Updating URL...");
        console.log("=".repeat(60));

        const { url_id, link_url, description } = await request.json();

        console.log("📋 [PUT] Request body received:", {
            url_id: url_id,
            link_url: link_url,
            description: description?.substring(0, 50) + "..." || "null"
        });

        if (!url_id || !link_url) {
            console.warn("⚠️  [PUT] Missing required fields");
            console.warn("   - url_id:", !!url_id);
            console.warn("   - link_url:", !!link_url);
            return NextResponse.json({ success: false, message: "URL ID and link URL are required" }, { status: 400 });
        }

        // Validate URL format
        console.log("✔️  [PUT] Validating URL format...");
        try {
            new URL(link_url);
            console.log("✅ [PUT] URL format is valid");
        } catch (err) {
            console.warn("⚠️  [PUT] Invalid URL format:", link_url);
            return NextResponse.json({ success: false, message: "Invalid URL format" }, { status: 400 });
        }

        const query = "UPDATE URL SET link_url = ?, description = ? WHERE url_id = ?";
        console.log("🗄️  [PUT] Query:", query);
        console.log("   - link_url:", link_url);
        console.log("   - description:", description || "null");
        console.log("   - url_id:", url_id);

        console.log("🔗 [PUT] Executing database query...");
        // ✅ FIX: Changed from chatmate.execute() to chatmate.query()
        const [result] = await chatmate.query(
            query,
            [link_url, description || null, url_id]
        );

        console.log("✅ [PUT] Update successful");
        console.log("   - Affected rows:", result.affectedRows);

        console.log("✨ [PUT] URL updated successfully");
        return NextResponse.json({ success: true, message: "URL updated successfully" });
    } catch (error) {
        console.error("\n" + "❌".repeat(30));
        console.error("❌ [PUT] Error updating URL");
        console.error("   - Message:", error.message);
        console.error("   - Code:", error.code);
        console.error("   - Stack:", error.stack);
        console.error("❌".repeat(30) + "\n");

        return NextResponse.json({ success: false, message: "Failed to update URL" }, { status: 500 });
    }
}

export async function DELETE(request) {
    try {
        console.log("\n" + "=".repeat(60));
        console.log("🗑️  [DELETE /api/admin/url] Deleting URL...");
        console.log("=".repeat(60));

        const { id } = await request.json();

        console.log("📋 [DELETE] Request body received:", {
            id: id
        });

        if (!id) {
            console.warn("⚠️  [DELETE] Missing required field: id");
            return NextResponse.json({ success: false, message: "URL ID is required" }, { status: 400 });
        }

        const query = "DELETE FROM URL WHERE url_id = ?";
        console.log("🗄️  [DELETE] Query:", query);
        console.log("   - url_id:", id);

        console.log("🔗 [DELETE] Executing database query...");
        // ✅ FIX: Changed from chatmate.execute() to chatmate.query()
        await chatmate.query(query, [id]);

        console.log("✨ [DELETE] URL deleted permanently");
        return NextResponse.json({ success: true, message: "URL deleted successfully" });
    } catch (error) {
        console.error("\n" + "❌".repeat(30));
        console.error("❌ [DELETE] Error deleting URL");
        console.error("   - Message:", error.message);
        console.error("   - Code:", error.code);
        console.error("   - Stack:", error.stack);
        console.error("❌".repeat(30) + "\n");

        return NextResponse.json({ success: false, message: "Failed to delete URL" }, { status: 500 });
    }
}