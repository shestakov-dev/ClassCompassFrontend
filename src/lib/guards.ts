import { getSession } from "@/services/kratos";
import { queryClient } from "./query-client";
import { ROUTE_HOME, ROUTE_LOGIN } from "@/config/urls";
import { redirect } from "react-router";

const getCachedSession = () => {
	return queryClient.fetchQuery({
		queryKey: ["session"],
		queryFn: getSession,
	});
};

export const requireAuthLoader = async ({ request }: { request: Request }) => {
	const session = await getCachedSession();

	if (!session) {
		const requestUrl = new URL(request.url);

		const loginUrl = new URL(ROUTE_LOGIN, requestUrl.origin);

		loginUrl.searchParams.set("return_to", requestUrl.pathname);

		throw redirect(loginUrl.toString());
	}

	return session;
};

export const requireGuestLoader = async () => {
	const session = await getCachedSession();

	if (session) {
		throw redirect(ROUTE_HOME);
	}

	return null;
};
