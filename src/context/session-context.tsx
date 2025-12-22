import type { RootLoaderData } from "@/loaders/root-loader";
import { createContext, useContext, type ReactNode } from "react";
import { useLoaderData, useRevalidator } from "react-router";
import type { UserEntity } from "@/api/generated/models";
import {
	getUsersControllerFindByIdentityIdQueryKey,
	useUsersControllerFindByIdentityId,
} from "@/api/generated/endpoints/users/users";
import type { AxiosError } from "axios";
import type { Session } from "@ory/client-fetch";
import { useQueryClient } from "@tanstack/react-query";

interface SessionContextType {
	session: Session | null;
	isAuthenticated: boolean;
	user: UserEntity | null;
	isLoading: boolean;
	error: AxiosError | null;
	refreshSession: () => Promise<void>;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export const useSession = () => {
	const context = useContext(SessionContext);

	if (context === undefined) {
		throw new Error("useSession must be used within a SessionProvider");
	}

	return context;
};

export function SessionProvider({ children }: { children: ReactNode }) {
	const { session } = useLoaderData<RootLoaderData>();
	const { revalidate } = useRevalidator();

	const queryClient = useQueryClient();

	const isAuthenticated = !!session;

	const identityId = session?.identity?.id;

	const {
		data: user,
		isLoading,
		error,
	} = useUsersControllerFindByIdentityId<UserEntity, AxiosError>(
		identityId ?? "",
		{
			query: {
				enabled: isAuthenticated && !!identityId,
				// Keep previous data while refetching to prevent flicker
				placeholderData: previousData => previousData,
			},
		}
	);

	const refreshSession = async () => {
		if (identityId) {
			// Invalidate user data to ensure fresh data is fetched (query level)
			await queryClient.invalidateQueries({
				queryKey: getUsersControllerFindByIdentityIdQueryKey(identityId),
			});
		}

		// Revalidate the session data (router level)
		revalidate();
	};

	return (
		<SessionContext.Provider
			value={{
				session,
				isAuthenticated,
				user: user ?? null,
				isLoading,
				error,
				refreshSession,
			}}>
			{children}
		</SessionContext.Provider>
	);
}
