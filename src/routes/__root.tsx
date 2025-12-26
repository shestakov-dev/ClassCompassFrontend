import { createRootRouteWithContext, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { Navbar } from "@/components/navbar";
import type { QueryClient } from "@tanstack/react-query";
import type { Session } from "@ory/client-fetch";
import ErrorPage from "@/pages/ErrorPage";
import { NotFoundPage } from "@/pages/NotFoundPage";

interface RouterContext {
	queryClient: QueryClient;
	session: Session | null;
}

export const Route = createRootRouteWithContext<RouterContext>()({
	component: RootComponent,
	errorComponent: ErrorPage,
	notFoundComponent: NotFoundPage,
});

function RootComponent() {
	return (
		<div className="min-h-screen bg-background font-sans antialiased flex flex-col">
			<Navbar />

			<main className="flex-1 flex flex-col min-h-0">
				<Outlet />
			</main>

			<TanStackRouterDevtools />
		</div>
	);
}
