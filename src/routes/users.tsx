import { createFileRoute } from "@tanstack/react-router";
import UsersPage from "@/pages/UsersPage";
import { requireAdmin } from "@/lib/route-guards";
import {
	getUsersControllerFindAllBySchoolQueryKey,
	usersControllerFindAllBySchool,
} from "@/api/generated/endpoints/users/users";
import {
	getSchoolsControllerGetAdminsQueryKey,
	schoolsControllerGetAdmins,
} from "@/api/generated/endpoints/schools/schools";
import {
	getClassesControllerFindAllBySchoolQueryKey,
	classesControllerFindAllBySchool,
} from "@/api/generated/endpoints/classes/classes";
import {
	getSubjectsControllerFindAllBySchoolQueryKey,
	subjectsControllerFindAllBySchool,
} from "@/api/generated/endpoints/subjects/subjects";

export const Route = createFileRoute("/users")({
	beforeLoad: async ({ context }) => {
		const user = await requireAdmin(context, "/users");

		// Prefetch all data in parallel
		await Promise.all([
			context.queryClient.ensureQueryData({
				queryKey: getUsersControllerFindAllBySchoolQueryKey(
					user.schoolId
				),
				queryFn: () => usersControllerFindAllBySchool(user.schoolId),
			}),
			context.queryClient.ensureQueryData({
				queryKey: getSchoolsControllerGetAdminsQueryKey(user.schoolId),
				queryFn: () => schoolsControllerGetAdmins(user.schoolId),
			}),
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
		]);
	},
	component: UsersPage,
});
