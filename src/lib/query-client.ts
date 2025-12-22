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

			toast.error(getErrorMessage(error));
		},
	}),
	mutationCache: new MutationCache({
		onError: (error, _variables, _context, mutation) => {
			if (mutation.meta?.suppressErrorToast) {
				return;
			}

			toast.error(getErrorMessage(error));
		},
	}),
});
