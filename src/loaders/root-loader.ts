import {
	identityIdContext,
	type RouterContextType,
} from "@/context/router-identity-context";
import type { LoaderFunctionArgs } from "react-router";

export async function rootLoader({ context }: LoaderFunctionArgs) {
	return {
		identityId: context.get(identityIdContext) as RouterContextType,
	};
}

export type RootLoaderData = Awaited<ReturnType<typeof rootLoader>>;
