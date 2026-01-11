import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreVertical, Info, Edit, Trash2 } from "lucide-react";
import { type LessonEntity } from "@/api/generated/models";
import { format, parseISO } from "date-fns";
import {
	WeekBadge,
	getLessonWeekVariant,
} from "@/components/schedule/week-badge";
import { useSession } from "@/context/session-context";

export const lessonCardVariants = cva("", {
	variants: {
		variant: {
			default: "border-l-primary",
			odd: "border-l-chart-3",
			even: "border-l-chart-4",
		},
	},
	defaultVariants: {
		variant: "default",
	},
});

export type LessonCardVariant = VariantProps<
	typeof lessonCardVariants
>["variant"];

type LayoutLesson = LessonEntity & {
	computedStart: Date;
	computedEnd: Date;
	style: {
		top: string;
		height: string;
		left: string;
		width: string;
	};
};

interface LessonCardProps {
	lesson: LayoutLesson;
	onClick?: (lesson: LessonEntity) => void;
	onEdit?: (lesson: LessonEntity) => void;
	onDelete?: (lesson: LessonEntity) => void;
}

export function LessonCard({
	lesson,
	onClick,
	onEdit,
	onDelete,
}: LessonCardProps) {
	const variant = getLessonWeekVariant(lesson.lessonWeek);
	const heightPx = parseFloat(lesson.style.height);

	const subjectName = lesson.subject?.name ?? "Unknown Subject";
	const roomName = lesson.room?.name ?? "Unknown Room";
	const teacherName = lesson.teacher?.user
		? `${lesson.teacher.user.firstName} ${lesson.teacher.user.lastName}`
		: "Unknown Teacher";
	const className = lesson.dailySchedule?.class?.name ?? "Unknown Class";

	const startTime = parseISO(lesson.startTime);
	const endTime = parseISO(lesson.endTime);
	const timeRange = `${format(startTime, "HH:mm")} - ${format(endTime, "HH:mm")}`;

	const { isAdmin } = useSession();

	return (
		<Card
			onClick={clickEvent => {
				clickEvent.stopPropagation();
				onClick?.(lesson);
			}}
			className={cn(
				"absolute z-10 border-l-4 cursor-pointer transition-all hover:shadow-lg overflow-hidden",
				"p-0 gap-0 shadow-sm flex flex-col justify-center",
				lessonCardVariants({ variant })
			)}
			style={lesson.style}>
			<CardHeader className="p-2 pb-1 gap-1 relative">
				<div className="flex items-start justify-between gap-1">
					<CardTitle className="text-base font-semibold truncate leading-tight flex-1">
						{subjectName}
					</CardTitle>
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button
								variant="ghost"
								size="icon"
								className="h-6 w-6 -mt-0.5 -mr-1"
								onClick={e => e.stopPropagation()}>
								<MoreVertical className="h-3.5 w-3.5" />
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end">
							<DropdownMenuItem
								onClick={e => {
									e.stopPropagation();
									onClick?.(lesson);
								}}>
								<Info className="h-4 w-4 mr-2" />
								Info
							</DropdownMenuItem>
							{isAdmin && (
								<>
									<DropdownMenuItem
										onClick={e => {
											e.stopPropagation();
											onEdit?.(lesson);
										}}>
										<Edit className="h-4 w-4 mr-2" />
										Edit
									</DropdownMenuItem>
									<DropdownMenuItem
										onClick={e => {
											e.stopPropagation();
											onDelete?.(lesson);
										}}
										className="text-destructive focus:text-destructive">
										<Trash2 className="h-4 w-4 mr-2 text-destructive focus:text-destructive" />
										Delete
									</DropdownMenuItem>
								</>
							)}
						</DropdownMenuContent>
					</DropdownMenu>
				</div>
				<div className="flex items-center gap-1.5 text-xs font-medium">
					<span>{timeRange}</span>
					<WeekBadge
						lessonWeek={lesson.lessonWeek}
						format="short"
						className="h-4 px-1.5 text-[10px]"
					/>
				</div>
			</CardHeader>

			<CardContent className="p-2 pt-0 text-xs opacity-80 space-y-0.5">
				<div className="truncate">{className}</div>
				<div className="truncate">{roomName}</div>
				{heightPx > 70 && (
					<div className="truncate opacity-90">{teacherName}</div>
				)}
			</CardContent>
		</Card>
	);
}
