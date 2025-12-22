import { AuthError } from "@/components/auth-error";
import { GlobalSpinner } from "@/components/global-spinner";
import { SessionProvider } from "@/context/session-context";
import type { rootLoader } from "@/loaders/root-loader";
import { Suspense } from "react";
import { Await, Outlet, useLoaderData } from "react-router";

export default function SessionLayout() {
	const { sessionPromise } = useLoaderData<typeof rootLoader>();

	return (
		<Suspense
			fallback={
				<div className="fixed inset-0 z-100 flex items-center justify-center bg-background/80 backdrop-blur-sm">
					<GlobalSpinner />
				</div>
			}>
			<Await
				resolve={sessionPromise}
				errorElement={<AuthError />}>
				{session => (
					<SessionProvider initialSession={session}>
						<Outlet />
					</SessionProvider>
				)}
			</Await>
		</Suspense>
	);
}
