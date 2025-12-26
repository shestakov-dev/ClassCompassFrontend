import { createFileRoute, redirect } from "@tanstack/react-router";
import { z } from "zod";
import {
	getLessonsControllerFindFilteredQueryKey,
	lessonsControllerFindFiltered,
} from "@/api/generated/endpoints/lessons/lessons";
import { type LessonsControllerFindFilteredParams } from "@/api/generated/models";
import { Day, LessonWeek } from "@/types/schedule";
import { getDefaultFilters } from "@/lib/schedule-defaults";
import {
	getUsersControllerFindByIdentityIdQueryKey,
	usersControllerFindByIdentityId,
} from "@/api/generated/endpoints/users/users";
import SchedulePage from "@/pages/SchedulePage";

const scheduleSearchSchema = z.object({
	mode: z.enum(["date", "weekly"]).default("weekly").optional(),
	date: z.iso.datetime().optional(),
	day: z.enum(Day).optional(),
	timestamp: z.iso.datetime().optional(),
	from: z.iso.datetime().optional(),
	to: z.iso.datetime().optional(),
	classId: z.uuidv4().optional(),
	teacherId: z.uuidv4().optional(),
	subjectId: z.uuidv4().optional(),
	roomId: z.uuidv4().optional(),
	week: z.enum(LessonWeek).optional(),
	ignoreWeek: z
		.union([z.boolean(), z.literal("true"), z.literal("false")])
		.transform(val => val === true || val === "true")
		.optional(),
});

export const Route = createFileRoute("/schedule")({
	validateSearch: search => scheduleSearchSchema.parse(search),
	loaderDeps: ({ search }) => search,
	loader: async ({
		context: { queryClient, session },
		deps: search,
		location,
	}) => {
		if (!session) {
			throw redirect({
				to: "/login",
				search: { return_to: location.href },
			});
		}

		const identityId = session.identity?.id;

		if (!identityId) {
			return;
		}

		const user = await queryClient.ensureQueryData({
			queryKey: getUsersControllerFindByIdentityIdQueryKey(identityId),
			queryFn: () => usersControllerFindByIdentityId(identityId),
		});

		if (!user.schoolId) {
			return;
		}

		const defaults = getDefaultFilters(user);
		const mode = search.mode ?? "weekly";

		// Base filters
		const apiFilters: LessonsControllerFindFilteredParams = {
			classId: search.classId ?? defaults.classId,
			teacherId: search.teacherId ?? defaults.teacherId,
			subjectId: search.subjectId,
			roomId: search.roomId,
			ignoreWeek: search.ignoreWeek,
		};

		if (mode === "date") {
			apiFilters.timestamp = search.timestamp;
			apiFilters.from = search.from;
			apiFilters.to = search.to;

			// Clear generic params
			apiFilters.day = undefined;
			apiFilters.week = undefined;
		} else {
			apiFilters.day = search.day ?? defaults.day;
			apiFilters.week = search.week;

			// Clear calendar params
			apiFilters.timestamp = undefined;
			apiFilters.from = undefined;
			apiFilters.to = undefined;
		}

		queryClient.prefetchQuery({
			queryKey: getLessonsControllerFindFilteredQueryKey(
				user.schoolId,
				apiFilters
			),
			queryFn: () =>
				lessonsControllerFindFiltered(user.schoolId!, apiFilters),
		});
	},
	component: SchedulePage,
});
