import { MutationCache, QueryCache, QueryClient } from "@tanstack/react-query";
import { getErrorMessage } from "./error-parsing";
import { toast } from "sonner";

export const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			retry: 1,
			refetchOnWindowFocus: false,
		},
	},
	queryCache: new QueryCache({
		onError: (error, query) => {
			if (query.meta?.suppressErrorToast) {
				return;
			}

			const errorMessage = getErrorMessage(error);
			const operationContext = query.meta?.operationContext as
				| string
				| undefined;

			if (operationContext) {
				toast.error(`Failed to ${operationContext}`, {
					description: errorMessage,
				});
			} else {
				toast.error(errorMessage);
			}
		},
	}),
	mutationCache: new MutationCache({
		onError: (error, _variables, _context, mutation) => {
			if (mutation.meta?.suppressErrorToast) {
				return;
			}

			const errorMessage = getErrorMessage(error);
			const operationContext = mutation.meta?.operationContext as
				| string
				| undefined;

			if (operationContext) {
				toast.error(`Failed to ${operationContext}`, {
					description: errorMessage,
				});
			} else {
				toast.error(errorMessage);
			}
		},
	}),
});
