import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import { LessonWeek } from "@/types/schedule";

export const lessonWeekBadgeVariants = cva(
	"text-[10px] font-bold uppercase tracking-wider",
	{
		variants: {
			variant: {
				default: "bg-primary/20 text-primary border-primary/30",
				odd: "bg-chart-3/20 text-chart-3 border-chart-3/30",
				even: "bg-chart-4/20 text-chart-4 border-chart-4/30",
			},
		},
		defaultVariants: {
			variant: "default",
		},
	}
);

export const lessonWeekBadgeSolidVariants = cva(
	"text-[10px] font-bold uppercase tracking-wider border-none shadow-none",
	{
		variants: {
			variant: {
				default: "bg-primary text-primary-foreground",
				odd: "bg-chart-3 text-white",
				even: "bg-chart-4 text-black",
			},
		},
		defaultVariants: {
			variant: "default",
		},
	}
);

export type LessonWeekVariant = VariantProps<
	typeof lessonWeekBadgeVariants
>["variant"];

export function getLessonWeekVariant(
	lessonWeek: LessonWeek
): LessonWeekVariant {
	if (lessonWeek === LessonWeek.odd) return "odd";
	if (lessonWeek === LessonWeek.even) return "even";
	return "default";
}

export function getLessonWeekText(
	lessonWeek: LessonWeek,
	format: "short" | "long" = "long"
): string {
	const text =
		lessonWeek === LessonWeek.odd
			? "Odd"
			: lessonWeek === LessonWeek.even
				? "Even"
				: "All";

	return format === "long" ? `${text} Weeks` : text;
}

interface WeekBadgeProps {
	lessonWeek: LessonWeek;
	format?: "short" | "long";
	solid?: boolean;
	className?: string;
}

export function WeekBadge({
	lessonWeek,
	format = "long",
	solid = false,
	className,
}: WeekBadgeProps) {
	const variant = getLessonWeekVariant(lessonWeek);
	const text = getLessonWeekText(lessonWeek, format);
	const variants = solid
		? lessonWeekBadgeSolidVariants
		: lessonWeekBadgeVariants;

	return (
		<Badge
			variant="outline"
			className={cn(variants({ variant }), className)}>
			{text}
		</Badge>
	);
}
