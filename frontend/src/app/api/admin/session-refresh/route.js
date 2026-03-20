import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { requireAdminSession } from "../../../../../library/auth/guard";

export async function POST() {
    const auth = await requireAdminSession();
    if (auth.error) return auth.error;
    try {
        const cookieStore = await cookies();
        const session = cookieStore.get("session");

        if (!session) {
            return NextResponse.json(
                { success: false, message: "No active session to refresh." },
                { status: 401 }
            );
        }

        // Reset the cookie maxAge back to 30 minutes from now (sliding session)
        cookieStore.set("session", session.value, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 30 * 60, // Reset to 30 minutes from now
            path: "/",
        });

        return NextResponse.json(
            { success: true, message: "Session refreshed." },
            { status: 200 }
        );
    } catch (error) {
        return NextResponse.json(
            { success: false, message: "Server error during session refresh." },
            { status: 500 }
        );
    }
}
