import type { LinkProps } from "@tanstack/react-router";
import type { ComponentType, SVGProps } from "react";

export type NavVisibility =
	| "authenticated"
	| "guest"
	| "admin"
	| "platform-admin";

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
	iconElement?: ComponentType<SVGProps<SVGSVGElement>>;
};

export type MainNavItem = NavGroup | NavLink;
