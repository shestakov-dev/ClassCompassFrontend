import { useCallback, useEffect } from "react";
import {
	type RecoveryFlow,
	handleFlowError,
	FlowType,
	isResponseError,
} from "@ory/client-fetch";
import { redirect, useNavigate, useSearch } from "@tanstack/react-router";
import { KRATOS_URL } from "@/config/urls";
import { createBrowserRecoveryFlow, getRecoveryFlow } from "@/services/kratos";
import { useQuery } from "@tanstack/react-query";

export function useRecoveryFlow(): RecoveryFlow | null | undefined {
	const navigate = useNavigate();
	const searchParams = useSearch({ strict: true, from: "/recovery" });

	const restartFlow = useCallback(() => {
		const params = new URLSearchParams(searchParams);

		// Redirect to Kratos to create a new recovery flow
		throw redirect({
			href: `${KRATOS_URL}/self-service/${FlowType.Recovery}/browser?${params.toString()}`,
		});
	}, [searchParams]);

	const {
		data: flow,
		error,
		isError,
	} = useQuery({
		queryKey: ["recovery-flow", searchParams.flow, searchParams.return_to],
		queryFn: async () => {
			if (searchParams.flow) {
				try {
					return await getRecoveryFlow(searchParams.flow);
				} catch (error) {
					// If the flow is Not Found (404), Gone (410), or Forbidden (403),
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

			return createBrowserRecoveryFlow({
				returnTo: searchParams.return_to,
			});
		},
		refetchOnWindowFocus: false,
		retry: false,
	});

	useEffect(() => {
		if (flow && searchParams.flow !== flow.id) {
			navigate({
				to: "/recovery",
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
