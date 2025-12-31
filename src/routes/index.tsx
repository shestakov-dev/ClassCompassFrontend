import { createFileRoute } from "@tanstack/react-router";
import { requireGuest } from "@/lib/route-guards";
import HomePage from "@/pages/HomePage";

export const Route = createFileRoute("/")({
	beforeLoad: ({ context }) => requireGuest(context),
	component: HomePage,
});
