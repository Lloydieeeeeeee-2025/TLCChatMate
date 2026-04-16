import { NextResponse } from "next/server";
import { requireAdminSession } from "../../../../../library/auth/guard";
import { getBackendUrl } from "../../../../lib/backendUrl";

export async function GET() {
    const auth = await requireAdminSession();
    if (auth.error) return auth.error;
    const base = getBackendUrl();
    try {
        const response = await fetch(`${base}/admin/check-updates`, {
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
        console.error('Check Updates API error:', error);
        return NextResponse.json({
            error: 'Internal server error checking updates',
            updates_available: false
        }, { status: 500 });
    }
}