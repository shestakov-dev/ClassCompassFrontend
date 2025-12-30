import { createFileRoute, redirect } from "@tanstack/react-router";
import UsersPage from "@/pages/UsersPage";
import {
	getUsersControllerFindByIdentityIdQueryKey,
	usersControllerFindByIdentityId,
	getUsersControllerFindAllBySchoolQueryKey,
	usersControllerFindAllBySchool,
} from "@/api/generated/endpoints/users/users";
import {
	getSchoolsControllerIsAdminQueryKey,
	schoolsControllerIsAdmin,
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
	beforeLoad: async ({ context: { queryClient, session } }) => {
		if (!session) {
			throw redirect({
				to: "/login",
				search: {
					return_to: "/users",
				},
			});
		}

		const identityId = session.identity?.id;

		if (!identityId) {
			throw redirect({ to: "/login" });
		}

		// Fetch user data
		const user = await queryClient.ensureQueryData({
			queryKey: getUsersControllerFindByIdentityIdQueryKey(identityId),
			queryFn: () => usersControllerFindByIdentityId(identityId),
		});

		if (!user.schoolId) {
			throw redirect({ to: "/" });
		}

		// Check if user is an admin
		const isAdmin = await queryClient.ensureQueryData({
			queryKey: getSchoolsControllerIsAdminQueryKey(
				user.schoolId,
				user.id
			),
			queryFn: () => schoolsControllerIsAdmin(user.schoolId, user.id),
		});

		if (!isAdmin) {
			throw redirect({ to: "/" });
		}

		// Prefetch all data in parallel
		await Promise.all([
			queryClient.ensureQueryData({
				queryKey: getUsersControllerFindAllBySchoolQueryKey(
					user.schoolId
				),
				queryFn: () => usersControllerFindAllBySchool(user.schoolId),
			}),
			queryClient.ensureQueryData({
				queryKey: getSchoolsControllerGetAdminsQueryKey(user.schoolId),
				queryFn: () => schoolsControllerGetAdmins(user.schoolId),
			}),
			queryClient.ensureQueryData({
				queryKey: getClassesControllerFindAllBySchoolQueryKey(
					user.schoolId
				),
				queryFn: () => classesControllerFindAllBySchool(user.schoolId),
			}),
			queryClient.ensureQueryData({
				queryKey: getSubjectsControllerFindAllBySchoolQueryKey(
					user.schoolId
				),
				queryFn: () => subjectsControllerFindAllBySchool(user.schoolId),
			}),
		]);
	},
	component: UsersPage,
});
