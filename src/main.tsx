import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "@/index.css";
import { RouterProvider } from "react-router";
import { router } from "@/router";
import { ThemeProvider } from "@/context/theme-context";
import { LoadingProvider } from "@/context/loading-context";
import {
	MutationCache,
	QueryCache,
	QueryClient,
	QueryClientProvider,
} from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/errorParsing";

const queryClient = new QueryClient({
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

createRoot(document.getElementById("root")!).render(
	<StrictMode>
		<QueryClientProvider client={queryClient}>
			<ThemeProvider>
				<LoadingProvider>
					<RouterProvider router={router} />
				</LoadingProvider>
			</ThemeProvider>

			<ReactQueryDevtools initialIsOpen={false} />
		</QueryClientProvider>
	</StrictMode>
);
