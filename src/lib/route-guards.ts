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
import {
	isValidSession,
	getIdentityId,
	isPlatformAdmin,
} from "@/lib/session-utils";

export function requireGuest({ session }: RouterContext) {
	if (session) {
		if (isPlatformAdmin(session)) {
			throw redirect({ to: "/schools" });
		}

		throw redirect({ to: "/schedule" });
	}
}

export async function requireAuth(
	{ queryClient, session }: RouterContext,
	returnTo?: string
) {
	if (!isValidSession(session)) {
		throw redirect({
			to: "/login",
			search: returnTo ? { return_to: returnTo } : undefined,
		});
	}

	const identityId = getIdentityId(session);

	if (!identityId) {
		throw redirect({ to: "/login" });
	}

	// Platform admins don't have user records
	if (isPlatformAdmin(session)) {
		return null;
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

	// Platform admins have full access
	if (isPlatformAdmin(context.session)) {
		return null;
	}

	// User must exist for school admin check
	if (!user) {
		throw redirect({ to: "/" });
	}

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

export async function requirePlatformAdmin(
	{ session }: RouterContext,
	returnTo?: string
) {
	if (!isValidSession(session) || !isPlatformAdmin(session)) {
		throw redirect({
			to: "/login",
			search: returnTo ? { return_to: returnTo } : undefined,
		});
	}
}
