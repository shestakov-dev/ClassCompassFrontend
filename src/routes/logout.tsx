import {
	createFileRoute,
	redirect,
	type LinkProps,
} from "@tanstack/react-router";
import { createLogoutFlow } from "@/services/kratos";

export const Route = createFileRoute("/logout")({
	preload: false,
	loader: async ({ context }) => {
		const HOME_ROUTE = "/" as const satisfies LinkProps["to"];

		if (!context.session) {
			throw redirect({ to: HOME_ROUTE });
		}

		const returnTo = new URL(HOME_ROUTE, window.location.origin).toString();

		const flow = await createLogoutFlow();

		if (flow?.logout_url) {
			const target = new URL(flow.logout_url);
			target.searchParams.set("return_to", returnTo);

			throw redirect({
				href: target.toString(),
			});
		} else {
			throw redirect({
				to: HOME_ROUTE,
			});
		}
	},
});
