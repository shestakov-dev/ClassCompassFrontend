import { KRATOS_URL } from "@/config/urls";

// Regex to find the internal URLs
// Matches: https://kratos:4433, http://localhost:4433, http://127.0.0.1:4433
const internalUrlRegex =
	/http(s)?:\/\/(kratos|localhost|127\.0\.0\.1)(:[0-9]+)?/g;

/**
 * A custom fetch wrapper that intercepts Ory Kratos responses and
 * replaces internal URLs with the public Kratos URL.
 */
export const kratosFetch = async (
	input: RequestInfo | URL,
	init?: RequestInit
): Promise<Response> => {
	// Perform the actual network request
	const response = await fetch(input, init);

	const isJson = response.headers
		.get("content-type")
		?.includes("application/json");

	if (!isJson) {
		return response;
	}

	const responseClone = response.clone();

	try {
		// Read the body as text
		const rawText = await responseClone.text();

		// Global replace of the internal URL with the public URL
		const sanitizedText = rawText.replaceAll(internalUrlRegex, KRATOS_URL);

		// Return a new Response with the sanitized body
		return new Response(sanitizedText, {
			status: response.status,
			statusText: response.statusText,
			headers: response.headers,
		});
	} catch (error) {
		console.error("Failed to sanitize Kratos response:", error);

		// Fallback to original response if something breaks
		return response;
	}
};
