import { getSession } from "@/services/kratos";
import type { Session } from "@ory/client-fetch";
import {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useEffectEvent,
	useState,
	type ReactNode,
} from "react";

interface AuthContextType {
	session: Session | null;
	isAuthenticated: boolean;
	isLoading: boolean;
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
	const [session, setSession] = useState<Session | null>(null);
	const [isLoading, setIsLoading] = useState(true);

	const refreshSession = useCallback(async () => {
		setIsLoading(true);

		const data = await getSession();

		setSession(data);

		setIsLoading(false);
	}, []);

	const onMount = useEffectEvent(() => {
		refreshSession();
	});

	// Initial check on mount
	useEffect(() => {
		onMount();
	}, []);

	return (
		<AuthContext.Provider
			value={{
				session,
				isAuthenticated: !!session,
				isLoading,
				refreshSession,
			}}>
			{children}
		</AuthContext.Provider>
	);
}
