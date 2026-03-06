import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import MapPage from "@/pages/MapPage";
import { requireAuth } from "@/lib/route-guards";
import { getSchoolId } from "@/lib/school-utils";
import {
	buildingsControllerFindAllBySchool,
	getBuildingsControllerFindAllBySchoolQueryKey,
} from "@/api/generated/endpoints/buildings/buildings";
import {
	getLessonsControllerFindFilteredQueryKey,
	lessonsControllerFindFiltered,
} from "@/api/generated/endpoints/lessons/lessons";
import { createLessonFilters } from "@/lib/schedule-utils";

const mapSearchSchema = z.object({
	buildingId: z.string().optional(),
	floorId: z.string().optional(),
	timestamp: z.string().optional(),
	ignoreWeek: z.boolean().optional(),
});

export const Route = createFileRoute("/map")({
	validateSearch: search => mapSearchSchema.parse(search),
	loaderDeps: ({ search }) => search,
	loader: async ({ context, deps: search, location }) => {
		const user = await requireAuth(context, location.href);

		const schoolId = getSchoolId(context.session, user);

		if (!schoolId) {
			return;
		}

		context.queryClient.prefetchQuery({
			queryKey: getBuildingsControllerFindAllBySchoolQueryKey(schoolId),
			queryFn: () => buildingsControllerFindAllBySchool(schoolId),
		});

		const timestamp = search.timestamp
			? new Date(search.timestamp)
			: new Date();

		const lessonFilters = createLessonFilters(timestamp, search.ignoreWeek);

		context.queryClient.prefetchQuery({
			queryKey: getLessonsControllerFindFilteredQueryKey(
				schoolId,
				lessonFilters
			),
			queryFn: () =>
				lessonsControllerFindFiltered(schoolId, lessonFilters),
		});
	},
	component: MapPage,
});
