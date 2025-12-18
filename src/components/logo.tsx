import { Link } from "react-router";
import { Compass } from "lucide-react";
import { cn } from "@/lib/utils";

interface LogoProps {
	className?: string;
	onClick?: () => void;
}

export function Logo({ className, onClick }: LogoProps) {
	return (
		<Link
			to="/"
			className={cn("group flex items-center space-x-2", className)}
			onClick={onClick}>
			<Compass className="h-6 w-6 text-primary transition-transform duration-500 group-hover:rotate-180" />
			<span className="font-bold inline-block transition-colors group-hover:text-primary">
				ClassCompass
			</span>
		</Link>
	);
}
