import type { OryApiError, StandardApiError } from "@/types/api-errors";
import type { ResponseError } from "@ory/client-fetch";
import { isAxiosError } from "axios";

export function isStandardApiError(data: unknown): data is StandardApiError {
	return (
		typeof data === "object" &&
		data !== null &&
		"message" in data &&
		typeof data.message === "string"
	);
}

export function isOryApiError(data: unknown): data is OryApiError {
	return (
		typeof data === "object" &&
		data !== null &&
		"error" in data &&
		typeof data.error === "object" &&
		data.error !== null &&
		"message" in data.error
	);
}

export function getErrorMessage(error: unknown): string {
	if (isAxiosError(error) && error.response?.data) {
		const data = error.response.data;

		if (isOryApiError(data)) {
			return data.error.message;
		}

		if (isStandardApiError(data)) {
			return data.message;
		}
	}

	if (error instanceof Error) {
		return error.message;
	}

	if (typeof error === "string") {
		return error;
	}

	return "An unknown error occurred";
}

export async function throwCleanOryError(error: ResponseError): Promise<never> {
	try {
		const body = await error.response.json();
		const message = body?.error?.message;

		if (message) {
			throw new Error(message);
		}
	} catch (error) {
		// If we successfully created a new error above, re-throw it
		if (
			error instanceof Error &&
			error.message !== "Unexpected end of JSON input"
		) {
			throw error;
		}
	}

	// If we couldn't parse anything, just throw the original
	throw error;
}
