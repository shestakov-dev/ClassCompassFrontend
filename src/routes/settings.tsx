import { createFileRoute } from "@tanstack/react-router";
import { SettingsPage } from "@/pages/SettingsPage";
import { z } from "zod";
import { requireAuth } from "@/lib/route-guards";

export const settingsSearchSchema = z.object({
	flow: z.string().optional(),
	return_to: z.string().optional(),
	flow_hint: z.string().optional(),
});

export const Route = createFileRoute("/settings")({
	validateSearch: search => settingsSearchSchema.parse(search),
	beforeLoad: async ({ context }) => {
		await requireAuth(context, "/settings");
	},
	component: SettingsPage,
});
