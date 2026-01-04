import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface StatCardProps {
	icon: LucideIcon;
	count: number;
	label: string;
	colorClass?: string;
	className?: string;
	onClick?: () => void;
}

export function StatCard({
	icon: Icon,
	count,
	label,
	colorClass,
	className,
	onClick,
}: StatCardProps) {
	return (
		<div
			onClick={onClick}
			className={cn(
				"relative overflow-hidden rounded-xl border border-border/50 bg-secondary/20 p-3 h-24 flex flex-col justify-end group/stat hover:bg-secondary/40 transition-colors",
				onClick && "cursor-pointer hover:border-primary/50",
				className
			)}>
			<Icon
				className={cn(
					"absolute -right-3 -bottom-3 w-20 h-20 opacity-[0.2] group-hover/stat:opacity-[0.12] transition-opacity -rotate-12",
					colorClass
				)}
			/>

			<span className="text-2xl font-bold text-foreground relative z-10">
				{count.toLocaleString()}
			</span>
			<span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider relative z-10">
				{label}
			</span>
		</div>
	);
}
