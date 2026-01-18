import { createFileRoute } from "@tanstack/react-router";
import { LoginPage } from "@/pages/LoginPage";
import { z } from "zod";
import { requireGuest } from "@/lib/route-guards";

const loginSearchSchema = z.object({
	flow: z.string().optional(),
	return_to: z.string().optional(),
	refresh: z.union([z.literal("true"), z.literal("false")]).optional(),
	aal: z.string().optional(),
	login_challenge: z.string().optional(),
	organization: z.string().optional(),
	via: z.string().optional(),
});

export const Route = createFileRoute("/login")({
	validateSearch: search => loginSearchSchema.parse(search),
	beforeLoad: ({ context }) => requireGuest(context),
	component: LoginPage,
});
