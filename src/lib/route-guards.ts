import { redirect } from "@tanstack/react-router";
import type { RouterContext } from "@/router";
import {
	getUsersControllerFindByIdentityIdQueryKey,
	usersControllerFindByIdentityId,
} from "@/api/generated/endpoints/users/users";
import {
	getSchoolsControllerIsAdminQueryKey,
	schoolsControllerIsAdmin,
} from "@/api/generated/endpoints/schools/schools";

export function requireGuest({ session }: RouterContext) {
	if (session) {
		throw redirect({ to: "/schedule" });
	}
}

export async function requireAuth(
	{ queryClient, session }: RouterContext,
	returnTo?: string
) {
	if (!session) {
		throw redirect({
			to: "/login",
			search: returnTo ? { return_to: returnTo } : undefined,
		});
	}

	const identityId = session.identity?.id;

	if (!identityId) {
		throw redirect({ to: "/login" });
	}

	// Fetch and return user data
	const user = await queryClient.ensureQueryData({
		queryKey: getUsersControllerFindByIdentityIdQueryKey(identityId),
		queryFn: () => usersControllerFindByIdentityId(identityId),
	});

	if (!user.schoolId) {
		throw redirect({ to: "/" });
	}

	return user;
}

export async function requireAdmin(context: RouterContext, returnTo?: string) {
	// First ensure user is authenticated
	const user = await requireAuth(context, returnTo);

	// Check admin status
	const isAdmin = await context.queryClient.ensureQueryData({
		queryKey: getSchoolsControllerIsAdminQueryKey(user.schoolId, user.id),
		queryFn: () => schoolsControllerIsAdmin(user.schoolId, user.id),
	});

	if (!isAdmin) {
		throw redirect({ to: "/" });
	}

	return user;
}
