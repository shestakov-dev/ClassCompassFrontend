import { type LessonEntity } from "@/api/generated/models";
import { type ScheduleEvent } from "@/components/daily-schedule-grid";
import { addDays, setHours, setMinutes, setSeconds } from "date-fns";

const DAY_TO_INDEX_MAP: Record<string, number> = {
	sunday: 0,
	monday: 1,
	tuesday: 2,
	wednesday: 3,
	thursday: 4,
	friday: 5,
	saturday: 6,
};

export function transformLessonsToEvents(
	lessons: LessonEntity[],
	weekStart: Date
): ScheduleEvent[] {
	// We no longer filter by week parity here.
	// The API is the source of truth for filtering.
	// If the API returns a lesson, we map it to the grid.

	return lessons.map(lesson => {
		const dayName = lesson.dailySchedule!.day.toLowerCase();
		const dayOffset = DAY_TO_INDEX_MAP[dayName];

		// Calculate target date based on the week start
		const targetDate = addDays(weekStart, dayOffset === 0 ? 6 : dayOffset - 1);

		const startObj = new Date(lesson.startTime);
		const endObj = new Date(lesson.endTime);

		// Use getHours() (Local) instead of getUTCHours() to prevent timezone shifts
		const start = setSeconds(
			setMinutes(setHours(targetDate, startObj.getHours()), startObj.getMinutes()),
			0
		);
		const end = setSeconds(
			setMinutes(setHours(targetDate, endObj.getHours()), endObj.getMinutes()),
			0
		);

		return {
			id: lesson.id,
			start,
			end,
			subject: lesson.subject!.name,
			room: lesson.room!.name,
			teacher: `${lesson.teacher!.user!.firstName} ${lesson.teacher!.user!.lastName}`,
			type: lesson.lessonWeek,
		};
	});
}
