import { requireAuthLoader } from "@/lib/guards";

export const scheduleLoader = async ({ request }: { request: Request }) => {
	// This ensures the user is authenticated before rendering the page
	await requireAuthLoader({ request });

	return null;
};
