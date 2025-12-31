import { createFileRoute } from "@tanstack/react-router";
import InfrastructurePage from "@/pages/InfrastructurePage";
import { requireAdmin } from "@/lib/route-guards";
import { z } from "zod";

const infrastructureSearchSchema = z.object({
	buildingId: z.string().optional(),
});

export const Route = createFileRoute("/infrastructure")({
	validateSearch: search => infrastructureSearchSchema.parse(search),
	beforeLoad: async ({ context }) => {
		await requireAdmin(context, "/infrastructure");
	},
	component: InfrastructurePage,
});
