import { Link } from "@tanstack/react-router";
import { User, LogOut, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useSession } from "@/context/session-context";

export function UserMenu() {
	const { user } = useSession();

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button variant="ghost" size="icon">
					<User className="h-5 w-5" />
					<span className="sr-only">User menu</span>
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end" className="w-48">
				{user && (
					<>
						<DropdownMenuLabel className="font-normal">
							<div className="flex flex-col gap-0.5">
								<p className="text-sm font-medium leading-none">
									{user.firstName} {user.lastName}
								</p>
								<p className="text-xs text-muted-foreground truncate">
									{user.email}
								</p>
							</div>
						</DropdownMenuLabel>
						<DropdownMenuSeparator />
					</>
				)}
				<DropdownMenuItem asChild>
					<Link to="/settings">
						<Settings className="mr-2 h-4 w-4" />
						Settings
					</Link>
				</DropdownMenuItem>
				<DropdownMenuSeparator />
				<DropdownMenuItem asChild>
					<Link
						to="/logout"
						className="text-destructive focus:text-destructive">
						<LogOut className="mr-2 h-4 w-4 text-destructive" />
						Log out
					</Link>
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
