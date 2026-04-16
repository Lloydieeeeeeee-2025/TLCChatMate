import { NextResponse } from "next/server";
import { RateLimiterMemory } from "rate-limiter-flexible";
import { getBackendUrl } from "../../../lib/backendUrl";

const chatRateLimiter = new RateLimiterMemory({
    points: 20,       // max requests allowed
    duration: 60,     // per 60 seconds
});

export async function POST(req) {
    // --- Rate limiting ---
    const ip =
        req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
        req.headers.get("x-real-ip") ||
        "unknown";

    try {
        await chatRateLimiter.consume(ip);
    } catch (rateLimitError) {
        const secs = Math.ceil(rateLimitError.msBeforeNext / 1000) || 60;
        return NextResponse.json(
            {
                success: false,
                error: `Too many requests. Please wait ${secs} second(s) before sending another message.`,
            },
            {
                status: 429,
                headers: { "Retry-After": String(secs) },
            }
        );
    }

    try {
        const { prompt, conversationSession, isNewPageLoad } = await req.json();

        // Input validation — prevent prompt-bombing and malformed requests
        if (!prompt || typeof prompt !== "string" || prompt.trim() === "") {
            return NextResponse.json(
                { success: false, error: "A valid prompt is required." },
                { status: 400 }
            );
        }
        if (prompt.length > 2000) {
            return NextResponse.json(
                { success: false, error: "Prompt exceeds maximum length of 2000 characters." },
                { status: 400 }
            );
        }
        if (conversationSession !== undefined && conversationSession !== null &&
            typeof conversationSession !== "string") {
            return NextResponse.json(
                { success: false, error: "Invalid conversationSession format." },
                { status: 400 }
            );
        }

        const base = getBackendUrl();
        const fastapiResponse = await fetch(`${base}/VirtualFrontDesk`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                prompt,
                conversationSession: conversationSession ?? "",
                isNewPageLoad: isNewPageLoad === true,
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
            },
            { status: 500 }
        );
    }
}