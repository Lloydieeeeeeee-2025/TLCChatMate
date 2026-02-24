import { NextResponse } from "next/server";

const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_BASE_URL || "http://backend:8000";

export async function POST(req) {
    try {
        const { prompt, conversationSession } = await req.json();

        // 
        // ${API_BASE_URL}/VirtualFrontDesk
        // http://127.0.0.1:8000/VirtualFrontDesk
        const fastapiResponse = await fetch(`${API_BASE_URL}/VirtualFrontDesk`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                prompt,
                conversationSession: conversationSession ?? ""
            }),
        });

        const text = await fastapiResponse.text();

        if (!fastapiResponse.ok) {
            return NextResponse.json(
                {
                    success: false,
                    error: "FastAPI backend error",
                    status: fastapiResponse.status,
                    detail: text,
                },
                { status: fastapiResponse.status }
            );
        }

        let backendData;
        try {
            backendData = JSON.parse(text);
        } catch {
            console.error("Failed to parse FastAPI JSON");
            return NextResponse.json(
                { success: false, error: "Invalid JSON from backend", raw: text },
                { status: 500 }
            );
        }

        // Wrap the backend response in the format your frontend expects
        return NextResponse.json({
            success: true,
            data: backendData
        }, { status: 200 });
    } catch (error) {
        console.error("Error in /api/chat route:", error);
        return NextResponse.json(
            {
                success: false,
                error: "Internal server error in Next.js API",
                details: error.message || String(error),
            },
            { status: 500 }
        );
    }
}