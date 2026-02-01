import { NextResponse } from "next/server";

const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_BASE_URL || "http://backend:8000";

export async function POST(req) {
    try {
        // Adjust these names to what your frontend actually sends
        const { prompt, sessionId } = await req.json();

        console.log("Sending request to FastAPI with prompt:", prompt);

        const fastapiResponse = await fetch(`${API_BASE_URL}/VirtualFrontDesk`, {
            method: "POST", // must match @app.post
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                // These keys must match PromptRequest in FastAPI
                prompt,
                session_id: sessionId ?? null,
            }),
        });

        console.log("FastAPI response status:", fastapiResponse.status);

        const text = await fastapiResponse.text();
        console.log("FastAPI raw body:", text);

        if (!fastapiResponse.ok) {
            return NextResponse.json(
                {
                    error: "FastAPI backend error",
                    status: fastapiResponse.status,
                    detail: text,
                },
                { status: fastapiResponse.status }
            );
        }

        // If FastAPI returns JSON like { answer: "...", session_id: "..." }
        let data;
        try {
            data = JSON.parse(text);
        } catch {
            console.error("Failed to parse FastAPI JSON");
            return NextResponse.json(
                { error: "Invalid JSON from backend", raw: text },
                { status: 500 }
            );
        }

        return NextResponse.json(data, { status: 200 });
    } catch (error) {
        console.error("Error in /api/chat route:", error);
        return NextResponse.json(
            {
                error: "Internal server error in Next.js API",
                details: error.message || String(error),
            },
            { status: 500 }
        );
    }
}