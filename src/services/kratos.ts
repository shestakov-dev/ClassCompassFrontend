import { Configuration, FrontendApi, ResponseError } from "@ory/client-fetch";
import { KRATOS_URL } from "@/config/urls";
import { throwCleanOryError } from "@/lib/error-parsing";

const kratosConfig = new Configuration({
	basePath: KRATOS_URL,
	credentials: "include",
});

const frontendApi = new FrontendApi(kratosConfig);

export async function getSession() {
	try {
		return await frontendApi.toSession();
	} catch (error) {
		if (error instanceof ResponseError) {
			// 401 is expected if the user isn't logged in
			if (error.response.status === 401) {
				return null;
			}

			// For other API errors, try to extract a clean message
			await throwCleanOryError(error);
		}

		// Fallback for network errors (fetch failed) or unknown issues
		throw error;
	}
}

export async function createLogoutFlow() {
	try {
		return await frontendApi.createBrowserLogoutFlow();
	} catch (error) {
		// 401 is expected if the user isn't logged in
		if (error instanceof ResponseError && error.response.status === 401) {
			return null;
		}

		throw error;
	}
}
