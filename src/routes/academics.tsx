import { createFileRoute } from "@tanstack/react-router";
import AcademicsPage from "@/pages/AcademicsPage";
import { requireAdmin } from "@/lib/route-guards";
import {
	getUsersControllerFindAllBySchoolQueryKey,
	usersControllerFindAllBySchool,
} from "@/api/generated/endpoints/users/users";
import {
	getClassesControllerFindAllBySchoolQueryKey,
	classesControllerFindAllBySchool,
} from "@/api/generated/endpoints/classes/classes";
import {
	getSubjectsControllerFindAllBySchoolQueryKey,
	subjectsControllerFindAllBySchool,
} from "@/api/generated/endpoints/subjects/subjects";
import { getSchoolId } from "@/lib/school-utils";

export const Route = createFileRoute("/academics")({
	beforeLoad: async ({ context }) => {
		const user = await requireAdmin(context, "/academics");

		const schoolId = getSchoolId(context.session, user);

		if (!schoolId) {
			return;
		}

		// Prefetch all data in parallel
		await Promise.all([
			context.queryClient.ensureQueryData({
				queryKey: getClassesControllerFindAllBySchoolQueryKey(schoolId),
				queryFn: () => classesControllerFindAllBySchool(schoolId),
			}),
			context.queryClient.ensureQueryData({
				queryKey:
					getSubjectsControllerFindAllBySchoolQueryKey(schoolId),
				queryFn: () => subjectsControllerFindAllBySchool(schoolId),
			}),
			context.queryClient.ensureQueryData({
				queryKey: getUsersControllerFindAllBySchoolQueryKey(schoolId),
				queryFn: () => usersControllerFindAllBySchool(schoolId),
			}),
		]);
	},
	component: AcademicsPage,
});
