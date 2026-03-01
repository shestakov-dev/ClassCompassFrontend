import { useState } from "react";
import { TimeGrid } from "@/components/schedule/daily-schedule-grid";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogDescription,
} from "@/components/ui/dialog";
import { type LessonEntity } from "@/api/generated/models";
import { WeekBadge } from "@/components/schedule/week-badge";
import { formatFlatTime } from "@/lib/schedule-utils";

interface DailyScheduleViewerProps {
	lessons: LessonEntity[];
	date: Date;
	onLessonClick?: (lesson: LessonEntity) => void;
	onEdit?: (lesson: LessonEntity) => void;
	onDelete?: (lesson: LessonEntity) => void;
}

export function DailyScheduleViewer({
	lessons,
	date,
	onLessonClick: externalOnLessonClick,
	onEdit,
	onDelete,
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

	return (
		<div className="h-full flex flex-col">
			<div className="flex-1 min-h-0 relative border rounded-md bg-background shadow-sm overflow-hidden">
				<TimeGrid
					lessons={lessons}
					date={date}
					onLessonClick={handleLessonClick}
					onEdit={onEdit}
					onDelete={onDelete}
				/>
			</div>

			{!externalOnLessonClick && (
				<Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
					<DialogContent className="max-w-md">
						<DialogHeader>
							<DialogTitle className="text-xl">
								{selectedLesson?.subject?.name ??
									"Lesson Details"}
							</DialogTitle>
							<DialogDescription className="flex items-center gap-2 mt-2 flex-wrap">
								<span className="bg-muted px-2.5 py-1 rounded text-sm font-medium capitalize">
									{selectedLesson?.dailySchedule?.day ??
										"N/A"}
								</span>
								<span className="bg-muted px-2.5 py-1 rounded text-sm font-medium">
									{selectedLesson?.startTime &&
										formatFlatTime(
											selectedLesson.startTime
										)}{" "}
									-{" "}
									{selectedLesson?.endTime &&
										formatFlatTime(selectedLesson.endTime)}
								</span>
								{selectedLesson && (
									<WeekBadge
										lessonWeek={selectedLesson.lessonWeek}
									/>
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
