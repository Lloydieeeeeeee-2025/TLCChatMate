import { NextResponse } from "next/server";

const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_BASE_URL || "http://backend:8000";

export async function POST(request) {
    try {
        // Parse the request body to get the prompt
        const { prompt, conversationSession, username } = await request.json();
        console.log("Received request body:", { prompt, conversationSession, username });

        console.log("Sending to FastAPI:", { prompt, conversationSession, username, API_BASE_URL });

        // Send request to FastAPI server
        const chat_response = await fetch(`${API_BASE_URL}/VirtualFrontDesk`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ prompt, conversationSession, username }),
        });

        console.log("FastAPI response status:", chat_response.status);

        // Check if the response is OK
        if (!chat_response.ok) {
            const errorText = await chat_response.text();
            console.error("FastAPI error response:", errorText);
            throw new Error(
                `HTTP error! status: ${chat_response.status}, body: ${errorText}`
            );
        }

        // Parse and return FastAPI response
        const data = await chat_response.json();
        console.log("FastAPI successful response:", data);

        return NextResponse.json(data);
    } catch (error) {
        console.error("Error in POST handler:", error);
        return NextResponse.json(
            { error: "Failed to fetch from FastAPI" },
            { status: 500 }
        );
    }
}