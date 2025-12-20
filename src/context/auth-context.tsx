import type { RootLoaderData } from "@/loaders/root-loader";
import type { Session } from "@ory/client-fetch";
import { createContext, useContext, type ReactNode } from "react";
import { useLoaderData, useRevalidator } from "react-router";

interface AuthContextType {
	session: Session | null;
	isAuthenticated: boolean;
	refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
	const context = useContext(AuthContext);

	if (context === undefined) {
		throw new Error("useAuth must be used within an AuthProvider");
	}

	return context;
};

export function AuthProvider({ children }: { children: ReactNode }) {
	const { session } = useLoaderData<RootLoaderData>();
	const { revalidate } = useRevalidator();

	const isAuthenticated = !!session;

	const refreshSession = async () => {
		revalidate();
	};

	return (
		<AuthContext.Provider
			value={{
				session,
				isAuthenticated,
				refreshSession,
			}}>
			{children}
		</AuthContext.Provider>
	);
}
