import { type LessonEntity } from "@/api/generated/models";
import { type ScheduleEvent } from "@/components/schedule/daily-schedule-grid";
import { addDays, parseISO, set } from "date-fns";
import { DAY_TO_INDEX_MAP } from "@/lib/schedule-defaults";

export function transformLessonsToEvents(
	lessons: LessonEntity[],
	weekStart: Date
): ScheduleEvent[] {
	return lessons.map(lesson => {
		const dayName = lesson.dailySchedule!.day;
		const dayOffset = DAY_TO_INDEX_MAP[dayName];

		// Calculate target date based on the week start (Monday)
		// If dayOffset is 0 (Sunday), we add 6 days.
		const daysToAdd = dayOffset === 0 ? 6 : dayOffset - 1;
		const targetDate = addDays(weekStart, daysToAdd);

		const startTime = parseISO(lesson.startTime);
		const endTime = parseISO(lesson.endTime);

		const start = set(targetDate, {
			hours: startTime.getHours(),
			minutes: startTime.getMinutes(),
		});

		const end = set(targetDate, {
			hours: endTime.getHours(),
			minutes: endTime.getMinutes(),
		});

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
