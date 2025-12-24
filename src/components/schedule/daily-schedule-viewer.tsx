import { useState, useMemo } from "react";
import {
	TimeGrid,
	type ScheduleEvent,
} from "@/components/schedule/daily-schedule-grid";
import { startOfWeek, format } from "date-fns";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogDescription,
} from "@/components/ui/dialog";
import { transformLessonsToEvents } from "@/lib/schedule-mappers";
import type { LessonEntity } from "@/api/generated/models";

interface DailyScheduleViewerProps {
	lessons: LessonEntity[];
	date: Date;
}

export function DailyScheduleViewer({
	lessons,
	date,
}: DailyScheduleViewerProps) {
	const [selectedEvent, setSelectedEvent] = useState<ScheduleEvent | null>(null);
	const [isModalOpen, setIsModalOpen] = useState(false);

	const events = useMemo(() => {
		const weekStart = startOfWeek(date, { weekStartsOn: 1 });
		return transformLessonsToEvents(lessons, weekStart);
	}, [lessons, date]);

	const handleEventClick = (event: ScheduleEvent) => {
		setSelectedEvent(event);
		setIsModalOpen(true);
	};

	return (
		<div className="h-full flex flex-col">
			<div className="flex-1 min-h-0 relative border rounded-md bg-background shadow-sm overflow-hidden">
				<TimeGrid
					events={events}
					date={date}
					onEventClick={handleEventClick}
				/>
			</div>

			<Dialog
				open={isModalOpen}
				onOpenChange={setIsModalOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>{selectedEvent?.subject}</DialogTitle>
						<DialogDescription className="flex items-center gap-2 mt-2">
							<span className="font-mono bg-primary/10 text-primary px-2 py-0.5 rounded text-xs font-semibold uppercase tracking-wide">
								{selectedEvent?.room}
							</span>
							<span className="text-muted-foreground">•</span>
							<span className="font-medium text-foreground">
								{selectedEvent?.start && format(selectedEvent.start, "HH:mm")} -
								{selectedEvent?.end && format(selectedEvent.end, "HH:mm")}
							</span>
						</DialogDescription>
					</DialogHeader>

					{selectedEvent && (
						<div className="grid gap-3 py-2 text-sm">
							<div className="flex justify-between border-b pb-2">
								<span className="text-muted-foreground">Teacher</span>
								<span className="font-medium">{selectedEvent.teacher}</span>
							</div>
							<div className="flex justify-between items-center">
								<span className="text-muted-foreground">Week Type</span>
								<span className="capitalize inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold bg-secondary text-secondary-foreground">
									{selectedEvent.type}
								</span>
							</div>
						</div>
					)}
				</DialogContent>
			</Dialog>
		</div>
	);
}
