import { useSession } from "@/context/session-context";
import { NAV_ITEMS, NAV_BUTTONS } from "@/config/navigation";
import type {
	BaseNavItem,
	MainNavItem,
	NavGroup,
	NavLink,
} from "@/types/navigation";
import { useSchoolsControllerIsAdmin } from "@/api/generated/endpoints/schools/schools";

function isNavGroup(item: MainNavItem): item is NavGroup {
	return item.type === "group";
}

function isNavLink(item: MainNavItem): item is NavLink {
	return item.type === "link";
}

function shouldShowNavItem(isAuthenticated: boolean, isAdmin: boolean, item: BaseNavItem) {
	if (item.visibility === "authenticated" && !isAuthenticated) {
		return false;
	}

	if (item.visibility === "guest" && isAuthenticated) {
		return false;
	}

	if (item.visibility === "admin" && !isAdmin) {
		return false;
	}

	return true;
}

export function useNavigationItems() {
	const { isAuthenticated, user } = useSession();

	const { data: isAdmin = false } = useSchoolsControllerIsAdmin(
		user?.schoolId ?? "",
		user?.id ?? "",
		{
			query: {
				enabled: !!user?.schoolId && !!user?.id,
			},
		}
	);

	const shouldShow = shouldShowNavItem.bind(null, isAuthenticated, isAdmin);

	const navGroups = NAV_ITEMS.filter(isNavGroup)
		.filter(shouldShow)
		.map(group => ({
			...group,
			items: group.items.filter(shouldShow),
		}));

	const navLinks = NAV_ITEMS.filter(isNavLink).filter(shouldShow);

	const navButtons = NAV_BUTTONS.filter(shouldShow);

	return {
		navGroups,
		navLinks,
		navButtons,
	};
}
