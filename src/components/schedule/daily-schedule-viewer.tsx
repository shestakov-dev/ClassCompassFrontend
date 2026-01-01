import { useState } from "react";
import { TimeGrid } from "@/components/schedule/daily-schedule-grid";
import { format, parseISO } from "date-fns";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import {
	type LessonEntity,
	LessonEntityLessonWeek as LessonWeek,
} from "@/api/generated/models";

const weekBadgeVariants = cva(
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

interface DailyScheduleViewerProps {
	lessons: LessonEntity[];
	date: Date;
	onLessonClick?: (lesson: LessonEntity) => void;
}

export function DailyScheduleViewer({
	lessons,
	date,
	onLessonClick: externalOnLessonClick,
}: DailyScheduleViewerProps) {
	const [selectedLesson, setSelectedLesson] = useState<LessonEntity | null>(
		null
	);
	const [isModalOpen, setIsModalOpen] = useState(false);

	const handleLessonClick = (lesson: LessonEntity) => {
		if (externalOnLessonClick) {
			externalOnLessonClick(lesson);
		} else {
			setSelectedLesson(lesson);
			setIsModalOpen(true);
		}
	};

	const getWeekBadgeVariant = (
		lessonWeek: string
	): VariantProps<typeof weekBadgeVariants>["variant"] => {
		if (lessonWeek === LessonWeek.odd) return "odd";
		if (lessonWeek === LessonWeek.even) return "even";
		return "default";
	};

	const getWeekBadgeText = (lessonWeek: string) => {
		if (lessonWeek === LessonWeek.every) return "Every Week";
		if (lessonWeek === LessonWeek.odd) return "Odd Weeks";
		if (lessonWeek === LessonWeek.even) return "Even Weeks";
		return lessonWeek;
	};

	return (
		<div className="h-full flex flex-col">
			<div className="flex-1 min-h-0 relative border rounded-md bg-background shadow-sm overflow-hidden">
				<TimeGrid
					lessons={lessons}
					date={date}
					onLessonClick={handleLessonClick}
				/>
			</div>

			{!externalOnLessonClick && (
				<Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
					<DialogContent className="max-w-md">
						<DialogHeader>
							<DialogTitle className="text-xl">
								{selectedLesson?.subject?.name ||
									"Lesson Details"}
							</DialogTitle>
							<DialogDescription className="flex items-center gap-2 mt-2 flex-wrap">
								<span className="bg-muted px-2.5 py-1 rounded text-sm font-medium capitalize">
									{selectedLesson?.dailySchedule?.day ||
										"N/A"}
								</span>
								<span className="bg-muted px-2.5 py-1 rounded text-sm font-medium">
									{selectedLesson?.startTime &&
										format(
											parseISO(selectedLesson.startTime),
											"HH:mm"
										)}{" "}
									-{" "}
									{selectedLesson?.endTime &&
										format(
											parseISO(selectedLesson.endTime),
											"HH:mm"
										)}
								</span>
								{selectedLesson && (
									<Badge
										variant="outline"
										className={cn(
											weekBadgeVariants({
												variant: getWeekBadgeVariant(
													selectedLesson.lessonWeek
												),
											})
										)}>
										{getWeekBadgeText(
											selectedLesson.lessonWeek
										)}
									</Badge>
								)}
							</DialogDescription>
						</DialogHeader>

						{selectedLesson && (
							<div className="grid gap-3 py-2 text-sm">
								<div className="flex justify-between border-b pb-2">
									<span className="text-muted-foreground">
										Class
									</span>
									<span className="font-medium">
										{selectedLesson.dailySchedule?.class
											?.name ?? "N/A"}
									</span>
								</div>
								<div className="flex justify-between border-b pb-2">
									<span className="text-muted-foreground">
										Room
									</span>
									<span className="font-medium">
										{selectedLesson.room?.name ?? "N/A"}
									</span>
								</div>
								<div className="flex justify-between border-b pb-2">
									<span className="text-muted-foreground">
										Teacher
									</span>
									<span className="font-medium">
										{selectedLesson.teacher?.user
											? `${selectedLesson.teacher.user.firstName} ${selectedLesson.teacher.user.lastName}`
											: "N/A"}
									</span>
								</div>
							</div>
						)}
					</DialogContent>
				</Dialog>
			)}
		</div>
	);
}
