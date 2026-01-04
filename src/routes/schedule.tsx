import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import {
	getLessonsControllerFindFilteredQueryKey,
	lessonsControllerFindFiltered,
} from "@/api/generated/endpoints/lessons/lessons";
import { Day, LessonWeek } from "@/types/schedule";
import { buildScheduleFilters } from "@/lib/schedule-utils";
import { requireAuth } from "@/lib/route-guards";
import SchedulePage from "@/pages/SchedulePage";
import { getSchoolId } from "@/lib/school-utils";
import {
	classesControllerFindAllBySchool,
	getClassesControllerFindAllBySchoolQueryKey,
} from "@/api/generated/endpoints/classes/classes";
import {
	getSubjectsControllerFindAllBySchoolQueryKey,
	subjectsControllerFindAllBySchool,
} from "@/api/generated/endpoints/subjects/subjects";
import {
	getTeachersControllerFindAllBySchoolQueryKey,
	teachersControllerFindAllBySchool,
} from "@/api/generated/endpoints/teachers/teachers";
import {
	buildingsControllerFindAllBySchool,
	getBuildingsControllerFindAllBySchoolQueryKey,
} from "@/api/generated/endpoints/buildings/buildings";

const scheduleSearchSchema = z.object({
	mode: z.enum(["date", "weekly"]).default("weekly").optional(),
	date: z.iso.datetime().optional(),
	day: z.enum(Day).optional(),
	timestamp: z.iso.datetime().optional(),
	from: z.iso.datetime().optional(),
	to: z.iso.datetime().optional(),
	classId: z.uuid().optional(),
	teacherId: z.uuid().optional(),
	subjectId: z.uuid().optional(),
	roomId: z.uuid().optional(),
	week: z.enum(LessonWeek).optional(),
	ignoreWeek: z
		.union([z.boolean(), z.literal("true"), z.literal("false")])
		.transform(val => val === true || val === "true")
		.optional(),
	showAll: z.boolean().optional(),
});

export const Route = createFileRoute("/schedule")({
	validateSearch: search => scheduleSearchSchema.parse(search),
	loaderDeps: ({ search }) => search,
	loader: async ({ context, deps: search, location }) => {
		const user = await requireAuth(context, location.href);

		const schoolId = getSchoolId(context.session, user);

		if (!schoolId) {
			return;
		}

		const apiFilters = buildScheduleFilters(user, search);

		// Prefetching
		context.queryClient.prefetchQuery({
			queryKey: getLessonsControllerFindFilteredQueryKey(
				schoolId,
				apiFilters
			),
			queryFn: () => lessonsControllerFindFiltered(schoolId, apiFilters),
		});

		context.queryClient.prefetchQuery({
			queryKey: getClassesControllerFindAllBySchoolQueryKey(schoolId),
			queryFn: () => classesControllerFindAllBySchool(schoolId),
		});

		context.queryClient.ensureQueryData({
			queryKey: getSubjectsControllerFindAllBySchoolQueryKey(schoolId),
			queryFn: () => subjectsControllerFindAllBySchool(schoolId),
		});

		context.queryClient.ensureQueryData({
			queryKey: getTeachersControllerFindAllBySchoolQueryKey(schoolId),
			queryFn: () => teachersControllerFindAllBySchool(schoolId),
		});

		context.queryClient.ensureQueryData({
			queryKey: getBuildingsControllerFindAllBySchoolQueryKey(schoolId),
			queryFn: () => buildingsControllerFindAllBySchool(schoolId),
		});
	},
	component: SchedulePage,
});
