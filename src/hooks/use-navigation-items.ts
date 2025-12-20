import { useAuth } from "@/context/auth-context";
import {
	NAV_ITEMS,
	NAV_BUTTONS,
	type NavGroup,
	type NavLink,
	type BaseNavItem,
	type MainNavItem,
} from "@/config/navigation";

function isNavGroup(item: MainNavItem): item is NavGroup {
	return item.type === "group";
}

function isNavLink(item: MainNavItem): item is NavLink {
	return item.type === "link";
}

function shouldShowNavItem(isAuthenticated: boolean, item: BaseNavItem) {
	if (item.visibility === "authenticated" && !isAuthenticated) {
		return false;
	}

	if (item.visibility === "guest" && isAuthenticated) {
		return false;
	}

	return true;
}

export function useNavigationItems() {
	const { isAuthenticated } = useAuth();

	const shouldShow = shouldShowNavItem.bind(null, isAuthenticated);

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
