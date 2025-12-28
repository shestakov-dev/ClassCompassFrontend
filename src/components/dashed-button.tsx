import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface DashedButtonProps {
	onClick: () => void;
	children: React.ReactNode;
	className?: string;
}

export function DashedButton({
	onClick,
	children,
	className,
}: DashedButtonProps) {
	return (
		<Button
			variant="outline"
			onClick={onClick}
			className={cn(
				"border-dashed border-2 hover:border-solid hover:border-primary dark:hover:border-primary hover:bg-primary/10 hover:text-primary text-muted-foreground transition-all",
				className
			)}>
			{children}
		</Button>
	);
}
