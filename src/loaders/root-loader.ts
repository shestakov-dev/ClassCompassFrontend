import {
	routerSessionContext,
	type RouterContextType,
} from "@/context/router-session-context";
import type { LoaderFunctionArgs } from "react-router";

export async function rootLoader({ context }: LoaderFunctionArgs) {
	return {
		session: context.get(routerSessionContext) as RouterContextType,
	};
}

export type RootLoaderData = Awaited<ReturnType<typeof rootLoader>>;
