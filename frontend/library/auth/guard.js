import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { chatmate } from "../tlcchatmatedb/route";

/**
 * Validates the current request's session cookie against the database.
 * Use at the top of every protected admin API handler.
 *
 * @returns {{ userId: string }} on success
 * @returns {{ error: NextResponse }}  on failure — return this directly from your handler
 *
 * Usage:
 *   const auth = await requireAdminSession();
 *   if (auth.error) return auth.error;
 */
export async function requireAdminSession() {
    try {
        const cookieStore = await cookies();
        const session = cookieStore.get("session");

        if (!session?.value) {
            return {
                error: NextResponse.json(
                    { success: false, message: "Unauthorized: No active session." },
                    { status: 401 }
                ),
            };
        }

        // Validate the session value is a plain integer (user_id)
        const userId = parseInt(session.value, 10);
        if (isNaN(userId) || userId <= 0) {
            return {
                error: NextResponse.json(
                    { success: false, message: "Unauthorized: Invalid session." },
                    { status: 401 }
                ),
            };
        }

        // Verify the user actually exists in the database
        const [rows] = await chatmate.query(
            "SELECT user_id FROM `User` WHERE user_id = ?",
            [userId]
        );

        if (!rows || rows.length === 0) {
            return {
                error: NextResponse.json(
                    { success: false, message: "Unauthorized: Session user not found." },
                    { status: 401 }
                ),
            };
        }

        return { userId: userId.toString() };
    } catch (err) {
        console.error("Auth guard error:", err);
        return {
            error: NextResponse.json(
                { success: false, message: "Server error during authentication." },
                { status: 500 }
            ),
        };
    }
}
