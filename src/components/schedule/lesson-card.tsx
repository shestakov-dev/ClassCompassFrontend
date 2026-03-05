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
import {
	WeekBadge,
	getLessonWeekVariant,
} from "@/components/schedule/week-badge";
import { useSession } from "@/context/session-context";
import { formatFlatTime } from "@/lib/schedule-utils";

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

interface LessonCardProps {
	lesson: LessonEntity;
	style?: React.CSSProperties;
	onClick?: (lesson: LessonEntity) => void;
	onEdit?: (lesson: LessonEntity) => void;
	onDelete?: (lesson: LessonEntity) => void;
	showMenu?: boolean;
	showRoom?: boolean;
	className?: string;
}

export function LessonCard({
	lesson,
	style,
	onClick,
	onEdit,
	onDelete,
	showMenu = true,
	showRoom = true,
	className: cardClassName,
}: LessonCardProps) {
	const variant = getLessonWeekVariant(lesson.lessonWeek);
	const heightPx = style?.height ? parseFloat(style.height as string) : 100;

	const subjectName = lesson.subject?.name ?? "Unknown Subject";
	const roomName = lesson.room?.name ?? "Unknown Room";
	const teacherName = lesson.teacher?.user
		? `${lesson.teacher.user.firstName} ${lesson.teacher.user.lastName}`
		: "Unknown Teacher";
	const className = lesson.dailySchedule?.class?.name ?? "Unknown Class";

	const timeRange = `${formatFlatTime(lesson.startTime)} - ${formatFlatTime(lesson.endTime)}`;

	const { isAdmin } = useSession();

	return (
		<Card
			onClick={
				onClick
					? clickEvent => {
							clickEvent.stopPropagation();
							onClick(lesson);
						}
					: undefined
			}
			className={cn(
				style && "absolute z-10",
				"border-l-4 transition-all overflow-hidden",
				"p-0 gap-0 shadow-sm flex flex-col justify-center",
				onClick && "cursor-pointer hover:shadow-lg",
				lessonCardVariants({ variant }),
				cardClassName
			)}
			style={style}>
			<CardHeader className="p-2 pb-1 gap-1 relative">
				<div className="flex items-start justify-between gap-1">
					<CardTitle className="text-base font-semibold truncate leading-tight flex-1">
						{subjectName}
					</CardTitle>
					{showMenu && (
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
					)}
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
				{showRoom && <div className="truncate">{roomName}</div>}
				{(heightPx > 70 || !style) && (
					<div className="truncate opacity-90">{teacherName}</div>
				)}
			</CardContent>
		</Card>
	);
}
