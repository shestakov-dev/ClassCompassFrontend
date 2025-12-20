import { Configuration, FrontendApi, ResponseError } from "@ory/client-fetch";

const kratosConfig = new Configuration({
	basePath: "https://kratos.classcompass.shestakov.app",
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
