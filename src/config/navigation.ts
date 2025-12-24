import { LogIn, LogOut } from "lucide-react";
import { ROUTE_LOGIN, ROUTE_LOGOUT } from "@/config/urls";
import type { MainNavItem, NavButton } from "@/types/navigation";

export const NAV_ITEMS: readonly MainNavItem[] = [
	{
		title: "Home",
		href: "/",
		visibility: "guest",
		type: "link",
	},
	{
		title: "Schedule",
		href: "/schedule",
		visibility: "authenticated",
		type: "link",
	},
] as const;

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
