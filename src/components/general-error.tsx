import { cn } from "@/lib/utils";
import { TriangleAlert } from "lucide-react";
import type { ComponentType, HTMLAttributes, ReactNode, SVGProps } from "react";

interface GeneralErrorProps extends HTMLAttributes<HTMLDivElement> {
	title?: string;
	message?: string;
	minimal?: boolean;
	icon?: ComponentType<SVGProps<SVGSVGElement>>;
	children?: ReactNode;
}

export function GeneralError({
	title = "Error",
	message = "An unexpected error has occurred.",
	minimal = false,
	icon: Icon = TriangleAlert,
	children,
	className,
	...props
}: GeneralErrorProps) {
	return (
		<div
			className={cn(
				"h-dvh flex flex-col items-center justify-center p-4 text-center bg-background text-foreground font-sans antialiased",
				minimal && "h-auto py-10",
				className
			)}
			{...props}>
			<div className="flex flex-col items-center justify-center space-y-6">
				<div className="rounded-full bg-muted p-6">
					<Icon className="h-12 w-12" />
				</div>
				<div className="flex flex-col items-center justify-center space-y-2">
					<h1 className="text-4xl font-bold tracking-tighter sm:text-6xl font-mono slashed-zero">
						{title}
					</h1>
					<p className="max-w-150 text-muted-foreground md:text-xl/relaxed text-balance">
						{message}
					</p>
				</div>
				{children && <div className="flex gap-4">{children}</div>}
			</div>
		</div>
	);
}
