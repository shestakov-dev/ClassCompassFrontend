import { createRouter } from "@tanstack/react-router";
import { routeTree } from "@/routeTree.gen";
import { queryClient } from "@/lib/query-client";
import type { QueryClient } from "@tanstack/react-query";
import type { Session } from "@ory/client-fetch";

export interface RouterContext {
	queryClient: QueryClient;
	session: Session | null;
}

export const router = createRouter({
	routeTree,
	context: {
		queryClient,
		session: null,
	},
	defaultPreload: "intent",
	defaultPreloadStaleTime: 0,
});

declare module "@tanstack/react-router" {
	interface Register {
		router: typeof router;
	}
}
