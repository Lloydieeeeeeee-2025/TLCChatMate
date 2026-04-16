/**
 * Base URL for server-side Next.js routes to reach the FastAPI backend.
 * Prefer BACKEND_URL (server-only); fall back to NEXT_PUBLIC_API_BASE_URL; then local dev.
 */
export function getBackendUrl() {
    const raw =
        process.env.BACKEND_URL ||
        process.env.NEXT_PUBLIC_API_BASE_URL ||
        "http://127.0.0.1:8000";
    return String(raw).replace(/\/+$/, "");
}
