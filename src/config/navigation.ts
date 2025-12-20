import { LogIn, LogOut } from "lucide-react";
import { ROUTE_LOGIN, ROUTE_LOGOUT } from "@/config/urls";

export type NavVisibility = "authenticated" | "guest";

export interface BaseNavItem {
	title: string;
	visibility?: NavVisibility;
}

export type NavItem = BaseNavItem & {
	href: string;
	description?: string;
	featured?: boolean;
};

export type NavGroup = BaseNavItem & {
	type: "group";
	items: NavItem[];
};

export type NavLink = BaseNavItem & {
	type: "link";
	href: string;
};

export type NavButton = BaseNavItem & {
	href: string;
	variant:
		| "default"
		| "destructive"
		| "outline"
		| "secondary"
		| "ghost"
		| "link";
	iconElement?: React.ComponentType<React.SVGProps<SVGSVGElement>>;
};

export type MainNavItem = NavGroup | NavLink;

export const NAV_ITEMS: readonly MainNavItem[] = [] as const;

export const NAV_BUTTONS: readonly NavButton[] = [
	{
		title: "Log In",
		href: ROUTE_LOGIN,
		variant: "default",
		iconElement: LogIn,
		visibility: "guest",
	},
	{
		title: "Log Out",
		href: ROUTE_LOGOUT,
		variant: "outline",
		iconElement: LogOut,
		visibility: "authenticated",
	},
] as const;
