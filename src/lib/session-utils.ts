import type { Session } from "@ory/client-fetch";

export function isValidSession(session: Session | null): boolean {
	return !!session?.identity?.id;
}

export function getIdentityId(session: Session | null): string | null {
	if (!session?.identity?.id) {
		return null;
	}

	return session.identity.id;
}

export function getPublicMetadata<T = unknown>(
	session: Session | null,
	key: string
): T | null {
	if (!session?.identity?.metadata_public) {
		return null;
	}

	const metadata = session.identity.metadata_public;

	if (typeof metadata !== "object" || metadata === null) {
		return null;
	}

	if (!(key in metadata)) {
		return null;
	}

	return (metadata as Record<string, unknown>)[key] as T;
}

export function isPlatformAdmin(session: Session | null): boolean {
	const identityType = getPublicMetadata<unknown>(session, "identityType");

	if (typeof identityType !== "string") {
		return false;
	}

	return identityType === "platform-admin";
}
