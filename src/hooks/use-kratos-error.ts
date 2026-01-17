import { useQuery } from "@tanstack/react-query";
import { useSearch } from "@tanstack/react-router";
import { getFlowError } from "@/services/kratos";
import { type FlowError } from "@ory/client-fetch";

export function useKratosError(): FlowError | undefined {
	const searchParams = useSearch({ strict: true, from: "/error" });

	const { data: error } = useQuery({
		queryKey: ["kratos-error", searchParams.id],
		queryFn: async () => {
			if (!searchParams.id) {
				return null;
			}

			return await getFlowError(searchParams.id);
		},
		enabled: !!searchParams.id,
		retry: false,
	});

	return error ?? undefined;
}
