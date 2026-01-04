import type { Session } from "@ory/client-fetch";
import type { UserEntity } from "@/api/generated/models";
import { isPlatformAdmin } from "@/lib/session-utils";

export const PLATFORM_ADMIN_SCHOOL_KEY = "platformAdminSelectedSchool";

export function getSchoolId(
	session: Session | null,
	user: UserEntity | null
): string | null {
	if (isPlatformAdmin(session)) {
		return getSchoolIdFromLocalStorage();
	}

	return user?.schoolId ?? null;
}

export function getSchoolIdFromLocalStorage(): string | null {
	return localStorage.getItem(PLATFORM_ADMIN_SCHOOL_KEY);
}

export function setSchoolIdToLocalStorage(schoolId: string | null): void {
	if (schoolId) {
		localStorage.setItem(PLATFORM_ADMIN_SCHOOL_KEY, schoolId);
	} else {
		localStorage.removeItem(PLATFORM_ADMIN_SCHOOL_KEY);
	}
}
