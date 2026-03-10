import { NextResponse } from "next/server";

const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_BASE_URL || "http://backend:8000";

export async function POST() {
    try {

        // ${API_BASE_URL}/admin/sync
        // http://127.0.0.1:8000/admin/sync 
        const response = await fetch(`${API_BASE_URL}/admin/sync`, {
            method: 'POST',
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
        console.error('Run Sync API error:', error);
        return NextResponse.json({
            success: false,
            message: 'Internal server error running sync'
        }, { status: 500 });
    }
}