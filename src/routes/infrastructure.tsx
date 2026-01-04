import { createFileRoute } from "@tanstack/react-router";
import InfrastructurePage from "@/pages/InfrastructurePage";
import { requireAdmin } from "@/lib/route-guards";
import { z } from "zod";
import {
	getBuildingsControllerFindAllBySchoolQueryKey,
	buildingsControllerFindAllBySchool,
} from "@/api/generated/endpoints/buildings/buildings";
import { getSchoolId } from "@/lib/school-utils";

const infrastructureSearchSchema = z.object({
	buildingId: z.string().optional(),
});

export const Route = createFileRoute("/infrastructure")({
	validateSearch: search => infrastructureSearchSchema.parse(search),
	beforeLoad: async ({ context }) => {
		const user = await requireAdmin(context, "/infrastructure");

		const schoolId = getSchoolId(context.session, user);

		if (!schoolId) {
			return;
		}

		context.queryClient.ensureQueryData({
			queryKey: getBuildingsControllerFindAllBySchoolQueryKey(schoolId),
			queryFn: () => buildingsControllerFindAllBySchool(schoolId),
		});
	},
	component: InfrastructurePage,
});
