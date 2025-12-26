import { createFileRoute, redirect } from "@tanstack/react-router";
import { LOGIN_URL } from "@/config/urls";
import { z } from "zod";

const loginSearchSchema = z.object({
	return_to: z.string().optional(),
});

export const Route = createFileRoute("/login")({
	validateSearch: search => loginSearchSchema.parse(search),
	beforeLoad: ({ search }) => {
		const returnToPath = search.return_to ?? "/";

		const returnToUrl = returnToPath.startsWith("http")
			? returnToPath
			: new URL(returnToPath, window.location.origin).toString();

		const target = new URL(LOGIN_URL);
		target.searchParams.set("return_to", returnToUrl);

		throw redirect({
			href: target.toString(),
		});
	},
});
