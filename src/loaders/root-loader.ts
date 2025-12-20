import {
	sessionContext,
	type RouterContextType,
} from "@/context/router-context";
import type { LoaderFunctionArgs } from "react-router";

export async function rootLoader({ context }: LoaderFunctionArgs) {
	return {
		session: context.get(sessionContext) as RouterContextType,
	};
}

export type RootLoaderData = Awaited<ReturnType<typeof rootLoader>>;
