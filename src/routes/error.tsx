import { createFileRoute } from "@tanstack/react-router";
import { OryErrorPage } from "@/pages/OryErrorPage";
import { z } from "zod";

export const errorSearchSchema = z.object({
	id: z.string().optional(),
});

export const Route = createFileRoute("/error")({
	validateSearch: search => errorSearchSchema.parse(search),
	component: OryErrorPage,
});
