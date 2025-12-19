import { LogIn } from "lucide-react";

export type NavItem = {
	title: string;
	href: string;
	description?: string;
	featured?: boolean;
};

export type NavGroup = {
	type: "group";
	title: string;
	items: NavItem[];
};

export type NavLink = {
	type: "link";
	title: string;
	href: string;
};

export type NavButton = {
	title: string;
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
		href: "https://classcompass.shestakov.app/login",
		variant: "default",
		iconElement: LogIn,
	},
] as const;
