import { useState, type PropsWithChildren } from "react";
import { Link } from "react-router";
import { Menu } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
	Sheet,
	SheetContent,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
	SheetFooter,
} from "@/components/ui/sheet";
import { ModeToggle } from "@/components/mode-toggle";
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/components/ui/accordion";
import { NAV_ITEMS, NAV_BUTTONS } from "@/config/navigation";
import { Logo } from "@/components/logo";

export function MobileNav() {
	const [open, setOpen] = useState(false);

	const handleLinkClick = () => {
		setOpen(false);
	};

	const navGroups = NAV_ITEMS.filter(item => item.type === "group");
	const navLinks = NAV_ITEMS.filter(item => item.type === "link");

	return (
		<Sheet
			open={open}
			onOpenChange={setOpen}>
			<SheetTrigger asChild>
				<Button
					variant="ghost"
					size="icon"
					className="md:hidden">
					<Menu className="h-5 w-5" />
					<span className="sr-only">Toggle menu</span>
				</Button>
			</SheetTrigger>

			<SheetContent
				side="left"
				className="w-75 sm:w-100 [&>button]:top-5.5">
				<SheetHeader className="text-left border-b pb-4 mb-4 px-6">
					<SheetTitle asChild>
						<Logo onClick={handleLinkClick} />
					</SheetTitle>
				</SheetHeader>

				<div className="flex flex-col px-6">
					{/* Accordion Menus */}
					{navGroups.length > 0 && (
						<Accordion
							type="single"
							collapsible
							className="w-full">
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
								className={cn(
									"flex w-full items-center py-4 text-base font-medium transition-colors hover:text-primary"
								)}
								onClick={handleLinkClick}>
								{item.title}
							</Link>
						))}
					</div>

					{/* Action Buttons */}
					<div className="flex flex-col gap-3 mt-6">
						{NAV_BUTTONS.map(item => (
							<Link
								key={item.href}
								to={item.href}
								onClick={handleLinkClick}>
								<Button
									variant={item.variant === "ghost" ? "outline" : item.variant}
									className="w-full">
									{item.title}
								</Button>
							</Link>
						))}
					</div>
				</div>

				<SheetFooter className="px-6 pb-6">
					<div className="flex w-full items-center justify-between border-t pt-4">
						<div className="flex flex-col text-xs text-muted-foreground gap-0.5">
							<span>© 2024-{new Date().getFullYear()} Alexander Shestakov</span>

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
			className="block select-none rounded-md p-3 text-base font-medium leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground">
			{children}
		</Link>
	);
}
