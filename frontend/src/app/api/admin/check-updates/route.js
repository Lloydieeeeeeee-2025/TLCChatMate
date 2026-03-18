import { NextResponse } from "next/server";

const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_BASE_URL || "http://backend:8000";

export async function GET() {
    try {

        // ${API_BASE_URL}/admin/check-updates
        // http://127.0.0.1:8000/admin/check-updates
        const response = await fetch(`${API_BASE_URL}/admin/check-updates`, {
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
        console.error('Check Updates API error:', error);
        return NextResponse.json({
            error: 'Internal server error checking updates',
            updates_available: false
        }, { status: 500 });
    }
}