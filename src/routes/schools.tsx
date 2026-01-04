import { createFileRoute } from "@tanstack/react-router";
import SchoolsPage from "@/pages/SchoolsPage";
import { requirePlatformAdmin } from "@/lib/route-guards";
import {
	getSchoolsControllerFindAllQueryKey,
	schoolsControllerFindAll,
} from "@/api/generated/endpoints/schools/schools";

export const Route = createFileRoute("/schools")({
	beforeLoad: async ({ context }) => {
		await requirePlatformAdmin(context, "/schools");

		await context.queryClient.ensureQueryData({
			queryKey: getSchoolsControllerFindAllQueryKey(),
			queryFn: () => schoolsControllerFindAll(),
		});
	},
	component: SchoolsPage,
});
