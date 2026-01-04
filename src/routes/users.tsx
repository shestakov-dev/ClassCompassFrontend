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
import { getSchoolId } from "@/lib/school-utils";

export const Route = createFileRoute("/users")({
	beforeLoad: async ({ context }) => {
		const user = await requireAdmin(context, "/users");

		const schoolId = getSchoolId(context.session, user);

		if (!schoolId) {
			return;
		}

		// Prefetching
		context.queryClient.ensureQueryData({
			queryKey: getUsersControllerFindAllBySchoolQueryKey(schoolId),
			queryFn: () => usersControllerFindAllBySchool(schoolId),
		});

		context.queryClient.ensureQueryData({
			queryKey: getSchoolsControllerGetAdminsQueryKey(schoolId),
			queryFn: () => schoolsControllerGetAdmins(schoolId),
		});

		context.queryClient.ensureQueryData({
			queryKey: getClassesControllerFindAllBySchoolQueryKey(schoolId),
			queryFn: () => classesControllerFindAllBySchool(schoolId),
		});

		context.queryClient.ensureQueryData({
			queryKey: getSubjectsControllerFindAllBySchoolQueryKey(schoolId),
			queryFn: () => subjectsControllerFindAllBySchool(schoolId),
		});
	},
	component: UsersPage,
});
