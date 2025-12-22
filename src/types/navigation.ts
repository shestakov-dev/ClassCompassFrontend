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
