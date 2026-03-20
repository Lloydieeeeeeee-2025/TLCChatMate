import { NextResponse } from "next/server";
import { chatmate } from "../../../../../library/tlcchatmatedb/route";
import { requireAdminSession } from "../../../../../library/auth/guard";

/**
 * SSRF protection: block internal/loopback addresses and non-http(s) schemes.
 */
function isUrlSafe(urlStr) {
    try {
        const parsed = new URL(urlStr);
        if (!['http:', 'https:'].includes(parsed.protocol)) return false;
        const hostname = parsed.hostname.toLowerCase();
        const blocked = [
            'localhost', '127.0.0.1', '0.0.0.0', '::1',
            '169.254.169.254',  // AWS/GCP/Azure metadata
            '10.0.0.1', 'host.docker.internal',
        ];
        // Block private IP ranges (10.x.x.x, 172.16-31.x.x, 192.168.x.x)
        if (
            /^10\./.test(hostname) ||
            /^172\.(1[6-9]|2\d|3[01])\./.test(hostname) ||
            /^192\.168\./.test(hostname) ||
            blocked.includes(hostname)
        ) return false;
        return true;
    } catch {
        return false;
    }
}



export async function GET() {
    const auth = await requireAdminSession();
    if (auth.error) return auth.error;
    try {

        const [rows] = await chatmate.execute("SELECT * FROM url ORDER BY url_id DESC");

        return NextResponse.json({ success: true, data: rows });
    } catch (error) {
        console.error("Error fetching URLs:", error);
        return NextResponse.json({ success: false, message: "Failed to fetch URLs" }, { status: 500 });
    }
}

export async function POST(request) {
    const auth = await requireAdminSession();
    if (auth.error) return auth.error;
    try {
        const { link_url, description } = await request.json();

        if (!link_url) {
            return NextResponse.json({ success: false, message: "URL is required" }, { status: 400 });
        }

        if (!isUrlSafe(link_url)) {
            return NextResponse.json({ success: false, message: "Invalid or disallowed URL. Only public http/https URLs are accepted." }, { status: 400 });
        }

        const [result] = await chatmate.execute(
            "INSERT INTO `url` (link_url, description) VALUES (?, ?)",
            [link_url, description || null]
        );

        return NextResponse.json({ success: true, data: { url_id: result.insertId } });
    } catch (error) {
        console.error("Error creating URL:", error);
        return NextResponse.json({ success: false, message: "Failed to create URL" }, { status: 500 });
    }
}

export async function PUT(request) {
    const auth = await requireAdminSession();
    if (auth.error) return auth.error;
    try {
        const { url_id, link_url, description } = await request.json();

        if (!url_id || !link_url) {
            return NextResponse.json({ success: false, message: "URL ID and link URL are required" }, { status: 400 });
        }

        if (!isUrlSafe(link_url)) {
            return NextResponse.json({ success: false, message: "Invalid or disallowed URL. Only public http/https URLs are accepted." }, { status: 400 });
        }

        await chatmate.execute(
            "UPDATE url SET link_url = ?, description = ? WHERE url_id = ?",
            [link_url, description || null, url_id]
        );

        return NextResponse.json({ success: true, message: "URL updated successfully" });
    } catch (error) {
        console.error("Error updating URL:", error);
        return NextResponse.json({ success: false, message: "Failed to update URL" }, { status: 500 });
    }
}

export async function DELETE(request) {
    const auth = await requireAdminSession();
    if (auth.error) return auth.error;
    try {
        const body = await request.json();
        const id = body.url_id || body.id;

        if (!id) {
            return NextResponse.json({ success: false, message: "URL ID is required" }, { status: 400 });
        }

        await chatmate.execute("DELETE FROM url WHERE url_id = ?", [id]);


        return NextResponse.json({ success: true, message: "URL deleted successfully" });
    } catch (error) {
        console.error("Error deleting URL:", error);
        return NextResponse.json({ success: false, message: "Failed to delete URL" }, { status: 500 });
    }
}