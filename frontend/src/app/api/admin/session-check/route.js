import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET() {
    try {
        const cookieStore = await cookies();
        const session = cookieStore.get("session");

        if (!session) {
            return NextResponse.json(
                { authenticated: false, message: "Session expired" },
                { status: 401 }
            );
        }

        return NextResponse.json(
            { authenticated: true },
            { status: 200 }
        );
    } catch (error) {
        return NextResponse.json(
            { authenticated: false, message: "Server error" },
            { status: 500 }
        );
    }
}
