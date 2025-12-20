import { Configuration, FrontendApi, ResponseError } from "@ory/client-fetch";
import { KRATOS_URL } from "@/config/urls";

const kratosConfig = new Configuration({
	basePath: KRATOS_URL,
	credentials: "include",
});

const frontendApi = new FrontendApi(kratosConfig);

export async function getSession() {
	try {
		return await frontendApi.toSession();
	} catch (error) {
		if (error instanceof ResponseError && error.response.status === 401) {
			// Not logged in
			return null;
		}

		throw error;
	}
}

export async function createLogoutFlow() {
	try {
		return await frontendApi.createBrowserLogoutFlow();
	} catch (error) {
		if (error instanceof ResponseError && error.response.status === 401) {
			// Not logged in
			return null;
		}

		throw error;
	}
}
