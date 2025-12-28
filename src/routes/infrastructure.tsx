import { createFileRoute, redirect } from "@tanstack/react-router";
import InfrastructurePage from "@/pages/InfrastructurePage";
import {
	getUsersControllerFindByIdentityIdQueryKey,
	usersControllerFindByIdentityId,
} from "@/api/generated/endpoints/users/users";
import {
	getSchoolsControllerIsAdminQueryKey,
	schoolsControllerIsAdmin,
} from "@/api/generated/endpoints/schools/schools";
import { z } from "zod";

const infrastructureSearchSchema = z.object({
	buildingId: z.string().optional(),
});

export const Route = createFileRoute("/infrastructure")({
	validateSearch: search => infrastructureSearchSchema.parse(search),
	beforeLoad: async ({ context: { queryClient, session } }) => {
		if (!session) {
			throw redirect({
				to: "/login",
				search: {
					return_to: "/infrastructure",
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
	},
	component: InfrastructurePage,
});
