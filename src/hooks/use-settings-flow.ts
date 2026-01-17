import { useCallback, useEffect } from "react";
import {
	type SettingsFlow,
	handleFlowError,
	FlowType,
	isResponseError,
} from "@ory/client-fetch";
import { redirect, useNavigate, useSearch } from "@tanstack/react-router";
import { KRATOS_URL } from "@/config/urls";
import { createBrowserSettingsFlow, getSettingsFlow } from "@/services/kratos";
import { useQuery } from "@tanstack/react-query";

export function useSettingsFlow(): SettingsFlow | null | undefined {
	const navigate = useNavigate();
	const searchParams = useSearch({ strict: true, from: "/settings" });

	const restartFlow = useCallback(() => {
		const params = new URLSearchParams(searchParams);

		// Redirect to Kratos to create a new settings flow
		throw redirect({
			href: `${KRATOS_URL}/self-service/${FlowType.Settings}/browser?${params.toString()}`,
		});
	}, [searchParams]);

	const {
		data: flow,
		error,
		isError,
	} = useQuery({
		queryKey: ["settings-flow", searchParams.flow, searchParams.return_to],
		queryFn: async () => {
			if (searchParams.flow) {
				try {
					return await getSettingsFlow(String(searchParams.flow));
				} catch (error) {
					// If flow is expired (410), not found (404), or forbidden (403),
					// create a new flow instead.
					if (isResponseError(error)) {
						const status = error.response.status;
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

			return createBrowserSettingsFlow({
				returnTo: searchParams.return_to,
			});
		},
		refetchOnWindowFocus: false,
		retry: false,
	});

	useEffect(() => {
		if (flow && searchParams.flow !== flow.id) {
			navigate({
				to: "/settings",
				search: prev => ({ ...prev, flow: flow.id }),
				replace: true,
			});
		}
	}, [flow, searchParams, navigate]);

	useEffect(() => {
		if (isError && error) {
			const errorHandler = handleFlowError({
				onValidationError: () => {},
				onRestartFlow: restartFlow,
				onRedirect: url => {
					throw redirect({ href: url });
				},
			});

			errorHandler(error);
		}
	}, [isError, error, restartFlow]);

	return flow;
}
