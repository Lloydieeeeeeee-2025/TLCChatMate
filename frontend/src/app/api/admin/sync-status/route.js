import { NextResponse } from "next/server";
import { requireAdminSession } from "../../../../../library/auth/guard";
import { getBackendUrl } from "../../../../lib/backendUrl";

export async function GET() {
    const auth = await requireAdminSession();
    if (auth.error) return auth.error;
    const base = getBackendUrl();
    try {
        const response = await fetch(`${base}/admin/sync-status`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
            cache: 'no-store'
        });

        if (!response.ok) {
            throw new Error(`FastAPI responded with status: ${response.status}`);
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error('Sync Status API error:', error);
        return NextResponse.json({
            step: null,
            status: "error",
            message: String(error?.message || "").toLowerCase().includes("fetch")
                ? `Cannot reach ChatMate API at ${base}. Set BACKEND_URL or NEXT_PUBLIC_API_BASE_URL, or start VirtualFrontDesk on port 8000.`
                : (error?.message || "Internal server error fetching status"),
        }, { status: 500 });
    }
}