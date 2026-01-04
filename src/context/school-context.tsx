import {
	createContext,
	useContext,
	useState,
	useEffect,
	useEffectEvent,
	type ReactNode,
} from "react";
import { useSession } from "@/context/session-context";
import { getSchoolId, setSchoolIdToLocalStorage } from "@/lib/school-utils";

interface SchoolContextType {
	schoolId: string | null;
	setSchoolId: (schoolId: string | null) => void;
	canChangeSchool: boolean;
}

const SchoolContext = createContext<SchoolContextType | undefined>(undefined);

export const useSchool = () => {
	const context = useContext(SchoolContext);

	if (context === undefined) {
		throw new Error("useSchool must be used within a SchoolProvider");
	}

	return context;
};

export function SchoolProvider({ children }: { children: ReactNode }) {
	const { session, user, isPlatformAdmin } = useSession();

	const canChangeSchool = isPlatformAdmin;

	const [schoolId, setSchoolId] = useState<string | null>(() =>
		getSchoolId(session, user)
	);

	const syncSchoolId = useEffectEvent(() => {
		const derivedSchoolId = getSchoolId(session, user);

		if (schoolId !== derivedSchoolId) {
			setSchoolId(derivedSchoolId);
		}
	});

	// Sync state with session/user changes
	useEffect(() => {
		syncSchoolId();
	}, [session, user, isPlatformAdmin]);

	// Clear stored school ID when user is no longer a platform admin
	useEffect(() => {
		if (!isPlatformAdmin) {
			setSchoolIdToLocalStorage(null);
		}
	}, [isPlatformAdmin]);

	const handleSetSchoolId = (newSchoolId: string | null) => {
		if (canChangeSchool) {
			setSchoolId(newSchoolId);
			setSchoolIdToLocalStorage(newSchoolId);
		}
	};

	return (
		<SchoolContext.Provider
			value={{
				schoolId,
				setSchoolId: handleSetSchoolId,
				canChangeSchool,
			}}>
			{children}
		</SchoolContext.Provider>
	);
}
