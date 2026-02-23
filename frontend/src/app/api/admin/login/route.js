import { NextResponse } from "next/server";
import { chatmate } from "../../../../../library/tlcchatmatedb/route";
import bcrypt from "bcryptjs";

import { cookies } from "next/headers";

export async function POST(request) {
    try {
        const { user_name, user_password } = await request.json();

        if (!user_name || !user_password) {
            return NextResponse.json(
                { success: false, message: "Username and password are required." },
                { status: 400 }
            );
        }

        const [userRows] = await chatmate.query(
            "SELECT user_id, user_name, user_password FROM `User` WHERE user_name = ?",
            [user_name]
        );

        if (userRows.length === 0) {
            return NextResponse.json(
                { success: false, message: "Invalid username or password." },
                { status: 401 }
            );
        }

        const authenticatedUser = userRows[0];
        const isPasswordValid = await bcrypt.compare(
            user_password,
            authenticatedUser.user_password
        );

        if (!isPasswordValid) {
            return NextResponse.json(
                { success: false, message: "Invalid username or password." },
                { status: 401 }
            );
        }

        // Set session cookie
        const cookieStore = await cookies();
        cookieStore.set("session", authenticatedUser.user_id.toString(), {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 30 * 60, // 30 minutes
            path: "/",
        });

        return NextResponse.json(
            {
                success: true,
                message: `Hello ${authenticatedUser.user_name}, Welcome back to TLC ChatMate!`,
                data: {
                    user_id: authenticatedUser.user_id,
                    user_name: authenticatedUser.user_name,
                },
            },
            { status: 200 }
        );
    } catch (error) {
        console.error("Login error - Full details:", error.message, error.code);
        return NextResponse.json(
            {
                success: false,
                message: "Server error during login.",
                debug: error.message // Remove this in production!
            },
            { status: 500 }
        );
    }
}