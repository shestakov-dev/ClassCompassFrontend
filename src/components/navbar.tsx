import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";
import {
	NavigationMenu,
	NavigationMenuContent,
	NavigationMenuItem,
	NavigationMenuLink,
	NavigationMenuList,
	NavigationMenuTrigger,
	navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { ModeToggle } from "@/components/mode-toggle";
import { Button } from "@/components/ui/button";
import { Compass } from "lucide-react";
import {
	forwardRef,
	type ComponentPropsWithoutRef,
	type ComponentRef,
} from "react";
import { MobileNav } from "@/components/mobile-nav";
import { Logo } from "@/components/logo";
import { useNavigationItems } from "@/hooks/use-navigation-items";

export function Navbar() {
	const { navGroups, navLinks, navButtons } = useNavigationItems();

	return (
		<header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
			<div className="container mx-auto flex h-14 max-w-screen-2xl items-center justify-between px-4 relative">
				{/* Left Section */}
				<div className="flex items-center gap-6">
					{/* Mobile Navigation Trigger */}
					<div className="md:hidden">
						<MobileNav />
					</div>

					{/* Desktop Logo & Navigation */}
					<div className="hidden md:flex items-center gap-6">
						<Logo />

						<div className="flex items-center gap-1">
							<NavigationMenu>
								<NavigationMenuList>
									{navGroups.map(item => (
										<NavigationMenuItem key={item.title}>
											<NavigationMenuTrigger>{item.title}</NavigationMenuTrigger>
											<NavigationMenuContent>
												<ul className="grid gap-3 p-6 md:w-100 lg:w-125 lg:grid-cols-[.75fr_1fr]">
													{item.items.map(subItem => {
														if (subItem.featured) {
															return (
																<li
																	key={subItem.title}
																	className="row-span-3">
																	<NavigationMenuLink asChild>
																		<Link
																			to={subItem.href}
																			className="flex h-full w-full select-none flex-col justify-end rounded-md bg-linear-to-b from-muted/50 to-muted p-6 no-underline outline-none focus:shadow-md hover:from-muted/60 hover:to-muted/80"
																			activeProps={{
																				className:
																					"from-primary/10 to-primary/20 text-primary hover:from-primary/20 hover:to-primary/30",
																			}}>
																			<Compass className="h-6 w-6 text-primary" />
																			<div className="mb-2 mt-4 text-lg font-medium">
																				{subItem.title}
																			</div>
																			<p className="text-sm leading-tight text-muted-foreground">
																				{subItem.description}
																			</p>
																		</Link>
																	</NavigationMenuLink>
																</li>
															);
														}
														return (
															<ListItem
																key={subItem.title}
																href={subItem.href}
																title={subItem.title}>
																{subItem.description}
															</ListItem>
														);
													})}
												</ul>
											</NavigationMenuContent>
										</NavigationMenuItem>
									))}
								</NavigationMenuList>
							</NavigationMenu>

							{navLinks.map(item => (
								<Link
									key={item.title}
									to={item.href}
									className={navigationMenuTriggerStyle()}
									activeProps={{
										className:
											"bg-primary/10 text-primary hover:bg-primary/20 hover:text-primary",
									}}>
									{item.title}
								</Link>
							))}
						</div>
					</div>
				</div>

				{/* Center Section (only visible on small screens) */}
				<div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 md:hidden">
					<Logo />
				</div>

				{/* Right Section */}
				<div className="flex items-center gap-2">
					{navButtons.map(item => (
						<Link
							key={item.href}
							to={item.href}>
							<Button
								variant={item.variant}
								size="sm"
								className="hidden md:inline-flex">
								{item.title}
							</Button>
							{/* Use an Icon for smaller screens */}
							<Button
								variant={item.variant}
								size="sm"
								className="md:hidden">
								{item.iconElement && <item.iconElement className="h-4 w-4" />}
							</Button>
						</Link>
					))}

					<div className="hidden md:inline-flex">
						<ModeToggle />
					</div>
				</div>
			</div>
		</header>
	);
}

const ListItem = forwardRef<
	ComponentRef<"a">,
	ComponentPropsWithoutRef<"a"> & {
		title: string;
		href: string;
	}
>(({ className, title, children, href, ...props }, ref) => {
	return (
		<li>
			<NavigationMenuLink asChild>
				<Link
					ref={ref}
					to={href}
					className={cn(
						"block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
						className
					)}
					activeProps={{
						className:
							"bg-primary/10 text-primary hover:bg-primary/20 hover:text-primary",
					}}
					{...props}>
					<div className="text-sm font-medium leading-none">{title}</div>
					<p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
						{children}
					</p>
				</Link>
			</NavigationMenuLink>
		</li>
	);
});

ListItem.displayName = "ListItem";
