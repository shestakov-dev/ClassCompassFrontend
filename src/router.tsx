import { createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";
import { queryClient } from "./lib/query-client";

export const router = createRouter({
	routeTree,
	context: {
		queryClient,
		session: null!,
	},
	defaultPreload: "intent",
	defaultPreloadStaleTime: 0,
});

declare module "@tanstack/react-router" {
	interface Register {
		router: typeof router;
	}
}
