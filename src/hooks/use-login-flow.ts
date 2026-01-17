import { useCallback, useEffect } from "react";
import {
	type LoginFlow,
	handleFlowError,
	FlowType,
	type CreateBrowserLoginFlowRequest,
	isResponseError,
} from "@ory/client-fetch";
import { redirect, useNavigate, useSearch } from "@tanstack/react-router";
import { KRATOS_URL } from "@/config/urls";
import { createBrowserLoginFlow, getLoginFlow } from "@/services/kratos";
import { useQuery } from "@tanstack/react-query";

export function useLoginFlow(): LoginFlow | null | undefined {
	const navigate = useNavigate();
	const searchParams = useSearch({ strict: true, from: "/login" });

	const restartFlow = useCallback(() => {
		const params = new URLSearchParams(searchParams);

		// Redirect to Kratos to create a new flow
		throw redirect({
			href: `${KRATOS_URL}/self-service/${FlowType.Login}/browser?${params.toString()}`,
		});
	}, [searchParams]);

	const {
		data: flow,
		error,
		isError,
	} = useQuery({
		queryKey: [
			"login-flow",
			searchParams.flow,
			searchParams.refresh,
			searchParams.aal,
		],
		queryFn: async () => {
			if (searchParams.flow) {
				try {
					return await getLoginFlow(searchParams.flow);
				} catch (error) {
					// If the flow is Not Found (404), Gone (410), or Forbidden (403),
					// create a new flow instead.
					if (isResponseError(error)) {
						const status = error.response.status;

						// Rethrow actual server errors (500s, etc)
						if (
							status !== 404 &&
							status !== 410 &&
							status !== 403
						) {
							throw error;
						}
					} else {
						throw error;
					}
				}
			}

			const initRequest: CreateBrowserLoginFlowRequest = {
				refresh: searchParams.refresh === "true",
				aal: searchParams.aal,
				returnTo: searchParams.return_to,
				loginChallenge: searchParams.login_challenge,
				organization: searchParams.organization,
				via: searchParams.via,
			};

			return createBrowserLoginFlow(initRequest);
		},
		refetchOnWindowFocus: false,
		retry: false,
	});

	useEffect(() => {
		if (flow && searchParams.flow !== flow.id) {
			navigate({
				to: "/login",
				search: { ...searchParams, flow: flow.id },
				replace: true,
			});
		}
	}, [flow, searchParams, navigate]);

	useEffect(() => {
		if (isError && error) {
			const errorHandler = handleFlowError({
				// Validation errors usually shouldn't happen on flow fetch,
				// only on submission. But if they do, we shouldn't crash.
				onValidationError: () => {},
				onRestartFlow: restartFlow,
				onRedirect: url => window.location.assign(url),
			});

			errorHandler(error);
		}
	}, [isError, error, restartFlow]);

	return flow;
}
