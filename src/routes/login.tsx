import { createFileRoute, redirect } from "@tanstack/react-router";
import { LoginPage } from "@/pages/LoginPage";
import { z } from "zod";
import { getSession } from "@/services/kratos";

export const loginSearchSchema = z.object({
	flow: z.string().optional(),
	return_to: z.string().optional(),
	refresh: z.union([z.literal("true"), z.literal("false")]).optional(),
	aal: z.string().optional(),
	login_challenge: z.string().optional(),
	organization: z.string().optional(),
	via: z.string().optional(),
});

export type LoginSearchParams = z.infer<typeof loginSearchSchema>;

export const Route = createFileRoute("/login")({
	validateSearch: search => loginSearchSchema.parse(search),
	beforeLoad: async ({ search }) => {
		if (search.refresh === "true") {
			const session = await getSession();

			if (session) {
				throw redirect({ to: search.return_to ?? "/" });
			}
		}
	},
	component: LoginPage,
});
