import {
	createContext,
	useCallback,
	useContext,
	useState,
	type ReactNode,
} from "react";
import { GlobalSpinner } from "@/components/ui/global-spinner";

interface LoadingContextType {
	isLoading: boolean;
	setIsLoading: (isLoading: boolean) => void;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

export function useLoading() {
	const context = useContext(LoadingContext);

	if (context === undefined) {
		throw new Error("useLoading must be used within a LoadingProvider");
	}

	return context;
}

export function LoadingProvider({ children }: { children: ReactNode }) {
	// If multiple processes trigger loading (e.g. auth & navigation),
	// we want the spinner to be present until ALL of them are finished
	const [loadingCount, setLoadingCount] = useState(0);

	const setIsLoading = useCallback((isLoading: boolean) => {
		setLoadingCount(prev => {
			if (isLoading) {
				return prev + 1;
			}

			return Math.max(0, prev - 1);
		});
	}, []);

	const isLoading = loadingCount > 0;

	return (
		<LoadingContext.Provider value={{ isLoading, setIsLoading }}>
			{isLoading && (
				<div className="fixed inset-0 z-100 flex items-center justify-center bg-background/80 backdrop-blur-sm">
					<GlobalSpinner />
				</div>
			)}
			{children}
		</LoadingContext.Provider>
	);
}
