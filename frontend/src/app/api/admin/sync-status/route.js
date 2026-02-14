import { NextResponse } from "next/server";

const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_BASE_URL || "http://backend:8000";

export async function GET() {
    try {

        // ${API_BASE_URL}/admin/sync-status  - production
        // http://127.0.0.1:8000/admin/sync-status - localhost
        const response = await fetch(`${API_BASE_URL}/admin/sync-status`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
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
            message: "Internal server error fetching status"
        }, { status: 500 });
    }
}