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

export const Route = createFileRoute("/academics")({
	beforeLoad: async ({ context }) => {
		const user = await requireAdmin(context, "/academics");

		// Prefetch all data in parallel
		await Promise.all([
			context.queryClient.ensureQueryData({
				queryKey: getClassesControllerFindAllBySchoolQueryKey(
					user.schoolId
				),
				queryFn: () => classesControllerFindAllBySchool(user.schoolId),
			}),
			context.queryClient.ensureQueryData({
				queryKey: getSubjectsControllerFindAllBySchoolQueryKey(
					user.schoolId
				),
				queryFn: () => subjectsControllerFindAllBySchool(user.schoolId),
			}),
			context.queryClient.ensureQueryData({
				queryKey: getUsersControllerFindAllBySchoolQueryKey(
					user.schoolId
				),
				queryFn: () => usersControllerFindAllBySchool(user.schoolId),
			}),
		]);
	},
	component: AcademicsPage,
});
