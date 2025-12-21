import type { RootLoaderData } from "@/loaders/root-loader";
import { createContext, useContext, type ReactNode } from "react";
import { useLoaderData, useRevalidator } from "react-router";
import type { UserEntity } from "@/api/generated/models";
import { useUsersControllerFindByIdentityId } from "@/api/generated/endpoints/users/users";
import type { AxiosError } from "axios";

interface SessionContextType {
	identityId: string | null;
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
	const { identityId } = useLoaderData<RootLoaderData>();
	const { revalidate } = useRevalidator();

	const isAuthenticated = !!identityId;

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
		revalidate();
	};

	return (
		<SessionContext.Provider
			value={{
				identityId,
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
