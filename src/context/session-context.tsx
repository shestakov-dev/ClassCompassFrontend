import { createContext, useContext, type ReactNode } from "react";
import type { UserEntity } from "@/api/generated/models";
import {
	getUsersControllerFindByIdentityIdQueryKey,
	useUsersControllerFindByIdentityId,
} from "@/api/generated/endpoints/users/users";
import {
	getSchoolsControllerIsAdminQueryKey,
	useSchoolsControllerIsAdmin,
} from "@/api/generated/endpoints/schools/schools";
import type { AxiosError } from "axios";
import type { Session } from "@ory/client-fetch";
import { keepPreviousData, useQueryClient } from "@tanstack/react-query";
import {
	isPlatformAdmin,
	getIdentityId,
	isValidSession,
} from "@/lib/session-utils";

interface SessionContextType {
	session: Session | null;
	isAuthenticated: boolean;
	user: UserEntity | null;
	isLoading: boolean;
	error: AxiosError | null;
	isAdmin: boolean;
	isPlatformAdmin: boolean;
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

export function SessionProvider({
	children,
	initialSession,
}: {
	children: ReactNode;
	initialSession: Session | null;
}) {
	const queryClient = useQueryClient();

	const isAuthenticated = isValidSession(initialSession);
	const identityId = getIdentityId(initialSession);
	const isPlatformAdminUser = isPlatformAdmin(initialSession);

	const {
		data: user = null,
		isLoading: isLoadingUser,
		error: userError,
	} = useUsersControllerFindByIdentityId<UserEntity, AxiosError>(
		identityId ?? "",
		{
			query: {
				enabled:
					isAuthenticated && !!identityId && !isPlatformAdminUser,
				placeholderData: keepPreviousData,
				meta: {
					operationContext: "get user data",
				},
			},
		}
	);

	const {
		data: isSchoolAdmin = false,
		isLoading: isLoadingAdmin,
		error: adminError,
	} = useSchoolsControllerIsAdmin<boolean, AxiosError>(
		user?.schoolId ?? "",
		user?.id ?? "",
		{
			query: {
				enabled: !!user,
				placeholderData: keepPreviousData,
				retry: false,
				meta: {
					operationContext: "check admin status",
				},
			},
		}
	);

	const isAdmin = isPlatformAdminUser || isSchoolAdmin;
	const isLoading = isLoadingUser || (!!user?.schoolId && isLoadingAdmin);
	const error = userError ?? adminError;

	const refreshSession = async () => {
		if (identityId) {
			// Invalidate user data to ensure fresh data is fetched
			await queryClient.invalidateQueries({
				queryKey:
					getUsersControllerFindByIdentityIdQueryKey(identityId),
			});

			// Also invalidate admin status if we have a user
			if (user) {
				await queryClient.invalidateQueries({
					queryKey: getSchoolsControllerIsAdminQueryKey(
						user.schoolId,
						user.id
					),
				});
			}
		}
	};

	return (
		<SessionContext.Provider
			value={{
				session: initialSession,
				isAuthenticated,
				user: user ?? null,
				isLoading,
				error,
				isAdmin,
				isPlatformAdmin: isPlatformAdminUser,
				refreshSession,
			}}>
			{children}
		</SessionContext.Provider>
	);
}
