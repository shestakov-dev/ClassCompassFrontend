import { LogIn, LogOut } from "lucide-react";
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
		href: "/login",
		variant: "default",
		iconElement: LogIn,
		visibility: "guest",
	},
	{
		title: "Log Out",
		href: "/logout",
		variant: "outline",
		iconElement: LogOut,
		visibility: "authenticated",
	},
] as const;
