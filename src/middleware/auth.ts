import { redirect } from "react-router";
import { getSession } from "@/services/kratos";
import { routerSessionContext } from "@/context/router-session-context";
import type { MiddlewareFunction } from "react-router";
import { ROUTE_LOGIN, ROUTE_HOME } from "@/config/urls";

// Tries to get session, but doesn't force redirect
// Ensures we have the session available for the whole app
export const sessionMiddleware: MiddlewareFunction = async (
	{ context },
	next
) => {
	const session = await getSession();

	context.set(routerSessionContext, session);

	return next();
};

// Checks if user is authenticated, if not redirects to login
export const requireAuthMiddleware: MiddlewareFunction = async (
	{ context },
	next
) => {
	const identityId = context.get(routerSessionContext);

	if (!identityId) {
		throw redirect(ROUTE_LOGIN);
	}

	return next();
};

// Checks if user is a guest, if authenticated redirects to home
export const requireGuestMiddleware: MiddlewareFunction = async (
	{ context },
	next
) => {
	const identityId = context.get(routerSessionContext);

	if (identityId) {
		throw redirect(ROUTE_HOME);
	}

	return next();
};
