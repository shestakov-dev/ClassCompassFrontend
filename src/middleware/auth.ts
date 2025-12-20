import { redirect } from "react-router";
import { getSession } from "@/services/kratos";
import { sessionContext } from "@/context/router-context";
import type { MiddlewareFunction } from "react-router";

// Tries to get session, but doesn't force redirect
// Ensures we have the session available for the whole app
export const sessionMiddleware: MiddlewareFunction = async (
	{ context },
	next
) => {
	const session = await getSession();

	context.set(sessionContext, session);

	return next();
};

// Checks if user is authenticated, if not redirects to login
export const requireAuthMiddleware: MiddlewareFunction = async (
	{ context },
	next
) => {
	const session = context.get(sessionContext);

	if (!session) {
		throw redirect("https://classcompass.shestakov.app/login");
	}

	return next();
};

// Checks if user is a guest, if authenticated redirects to home
export const requireGuestMiddleware: MiddlewareFunction = async (
	{ context },
	next
) => {
	const session = context.get(sessionContext);

	if (session) {
		throw redirect("/");
	}

	return next();
};
