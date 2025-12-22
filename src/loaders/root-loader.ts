import { getSession } from "@/services/kratos";

export async function rootLoader() {
	const sessionPromise = getSession();

	return {
		sessionPromise,
	};
}
