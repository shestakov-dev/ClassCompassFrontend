import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { RecoveryPage } from "@/pages/RecoveryPage";
import { requireGuest } from "@/lib/route-guards";

const recoverySearchSchema = z.object({
	return_to: z.string().optional(),
	flow: z.string().optional(),
});

export const Route = createFileRoute("/recovery")({
	validateSearch: search => recoverySearchSchema.parse(search),
	beforeLoad: ({ context }) => requireGuest(context),
	component: RecoveryPage,
});
