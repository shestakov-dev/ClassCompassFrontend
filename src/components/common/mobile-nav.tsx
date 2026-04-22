import { useState, type PropsWithChildren } from "react";
import { Link } from "@tanstack/react-router";
import { Menu, Settings, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	Sheet,
	SheetContent,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
	SheetFooter,
} from "@/components/ui/sheet";
import { ModeToggle } from "@/components/common/mode-toggle";
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/components/ui/accordion";
import { Logo } from "@/components/common/nav-logo";
import { useNavigationItems } from "@/hooks/use-navigation-items";
import { SchoolSelector } from "@/components/common/school-selector";
import { useSession } from "@/context/session-context";

export function MobileNav() {
	const [open, setOpen] = useState(false);
	const { navGroups, navLinks, navButtons } = useNavigationItems();
	const { isAuthenticated, user } = useSession();

	const handleLinkClick = () => {
		setOpen(false);
	};

	return (
		<Sheet open={open} onOpenChange={setOpen}>
			<SheetTrigger asChild>
				<Button variant="ghost" size="icon" className="nav:hidden">
					<Menu className="h-5 w-5" />
					<span className="sr-only">Toggle menu</span>
				</Button>
			</SheetTrigger>

			<SheetContent
				side="left"
				className="w-75 sm:w-100 [&>button]:top-5.5 overflow-hidden">
				<SheetHeader className="text-left border-b pb-4 px-6">
					<SheetTitle asChild>
						<Logo onClick={handleLinkClick} />
					</SheetTitle>
				</SheetHeader>

				{/* Scrollable middle */}
				<div className="flex-1 overflow-y-auto px-6 py-4 min-h-0">
					<div className="mb-4">
						<p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">
							Current School
						</p>
						<SchoolSelector className="w-full" />
					</div>

					{/* Accordion Menus */}
					{navGroups.length > 0 && (
						<Accordion type="single" collapsible className="w-full">
							{navGroups.map(item => (
								<AccordionItem
									key={item.title}
									value={item.title}>
									<AccordionTrigger className="text-base hover:no-underline hover:text-primary">
										{item.title}
									</AccordionTrigger>
									<AccordionContent className="flex flex-col gap-2">
										{item.items?.map(subItem => (
											<MobileLink
												key={subItem.href}
												to={subItem.href}
												onClick={handleLinkClick}>
												{subItem.title}
											</MobileLink>
										))}
									</AccordionContent>
								</AccordionItem>
							))}
						</Accordion>
					)}

					{/* Regular Links */}
					<div className="flex flex-col">
						{navLinks.map(item => (
							<Link
								key={item.href}
								to={item.href}
								className="flex w-full items-center py-4 text-base font-medium transition-colors hover:text-primary"
								activeProps={{ className: "text-primary" }}
								onClick={handleLinkClick}>
								{item.title}
							</Link>
						))}
					</div>
				</div>

				{/* Action Buttons */}
				<div className="px-6 pb-2 flex flex-col gap-3">
					{isAuthenticated ? (
						<>
							{user && (
								<div className="px-1 py-1">
									<p className="text-sm font-medium leading-none">
										{user.firstName} {user.lastName}
									</p>
									<p className="text-xs text-muted-foreground truncate mt-0.5">
										{user.email}
									</p>
								</div>
							)}
							<Link
								to="/settings"
								onClick={handleLinkClick}
								className="block"
								activeProps={{
									className:
										"block [&>button]:bg-secondary [&>button]:border-secondary",
								}}>
								<Button variant="outline" className="w-full">
									<Settings className="mr-2 h-4 w-4" />
									Settings
								</Button>
							</Link>
							<Link to="/logout" onClick={handleLinkClick}>
								<Button
									variant="outline"
									className="w-full text-destructive hover:text-destructive">
									<LogOut className="mr-2 h-4 w-4 text-destructive" />
									Log out
								</Button>
							</Link>
						</>
					) : (
						navButtons.map(item => (
							<Link
								key={item.href}
								to={item.href}
								onClick={handleLinkClick}>
								<Button
									variant={
										item.variant === "ghost"
											? "outline"
											: item.variant
									}
									className="w-full">
									{item.title}
								</Button>
							</Link>
						))
					)}
				</div>

				<SheetFooter className="px-6 pb-6">
					<div className="flex w-full items-center justify-between border-t pt-4">
						<div className="flex flex-col text-xs text-muted-foreground gap-0.5">
							<span>
								© 2024-{new Date().getFullYear()} Alexander
								Shestakov
							</span>

							<a
								href="http://creativecommons.org/licenses/by-nc-nd/4.0/"
								target="_blank"
								rel="noreferrer"
								className="hover:underline hover:text-foreground transition-colors"
								title="Creative Commons Attribution-NonCommercial-NoDerivatives 4.0 International">
								CC BY-NC-ND 4.0 License
							</a>
						</div>

						<ModeToggle />
					</div>
				</SheetFooter>
			</SheetContent>
		</Sheet>
	);
}

interface MobileLinkProps extends PropsWithChildren {
	to: string;
	onClick: () => void;
}

function MobileLink({ to, onClick, children }: MobileLinkProps) {
	return (
		<Link
			to={to}
			onClick={onClick}
			className="block select-none rounded-md p-3 text-base font-medium leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
			activeProps={{ className: "bg-primary/10 text-primary" }}>
			{children}
		</Link>
	);
}
