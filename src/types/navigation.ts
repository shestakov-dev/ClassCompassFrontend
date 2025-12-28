import type { LinkProps } from "@tanstack/react-router";

export type NavVisibility = "authenticated" | "guest" | "admin";

export interface BaseNavItem {
	title: string;
	visibility?: NavVisibility;
}

export type NavItem = BaseNavItem & {
	href: Exclude<LinkProps["to"], undefined>;
	description?: string;
	featured?: boolean;
};

export type NavGroup = BaseNavItem & {
	type: "group";
	items: NavItem[];
};

export type NavLink = BaseNavItem & {
	type: "link";
	href: LinkProps["to"];
};

export type NavButton = BaseNavItem & {
	href: LinkProps["to"];
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
