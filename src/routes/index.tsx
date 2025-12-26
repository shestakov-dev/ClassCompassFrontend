import { createFileRoute, redirect } from "@tanstack/react-router";
import HomePage from "@/pages/HomePage";

export const Route = createFileRoute("/")({
	beforeLoad: ({ context }) => {
		// If the user is logged in, redirect to the schedule page
		if (context.session) {
			throw redirect({ to: "/schedule" });
		}
	},
	component: HomePage,
});
