import {
	Configuration,
	FrontendApi,
	isResponseError,
	type CreateBrowserLoginFlowRequest,
	type CreateBrowserSettingsFlowRequest,
	type LoginFlow,
	type SettingsFlow,
} from "@ory/client-fetch";
import { KRATOS_URL } from "@/config/urls";
import { throwCleanOryError } from "@/lib/error-parsing";

const kratosConfig = new Configuration({
	basePath: KRATOS_URL,
	credentials: "include",
	headers: {
		Accept: "application/json",
	},
});

const frontendApi = new FrontendApi(kratosConfig);

export async function getSession() {
	try {
		return await frontendApi.toSession();
	} catch (error) {
		if (isResponseError(error)) {
			// 401 is expected if the user isn't logged in
			if (error.response.status === 401) {
				return null;
			}

			await throwCleanOryError(error);
		}

		throw error;
	}
}

export async function createLogoutFlow() {
	try {
		return await frontendApi.createBrowserLogoutFlow();
	} catch (error) {
		// 401 is expected if the user isn't logged in
		if (isResponseError(error) && error.response.status === 401) {
			return null;
		}

		throw error;
	}
}

export async function createBrowserLoginFlow(
	params: CreateBrowserLoginFlowRequest
): Promise<LoginFlow> {
	return await frontendApi.createBrowserLoginFlow(params);
}

export async function getLoginFlow(flowId: string): Promise<LoginFlow> {
	return await frontendApi.getLoginFlow({ id: flowId });
}

export async function createBrowserSettingsFlow(
	params: CreateBrowserSettingsFlowRequest = {}
): Promise<SettingsFlow> {
	return await frontendApi.createBrowserSettingsFlow(params);
}

export async function getSettingsFlow(flowId: string): Promise<SettingsFlow> {
	return await frontendApi.getSettingsFlow({ id: flowId });
}
