import {
	LessonEntityLessonWeek as LessonWeek,
	type LessonEntity,
} from "@/api/generated/models";
import { type ScheduleEvent } from "@/components/daily-schedule-grid";
import {
	addDays,
	getISOWeek,
	setHours,
	setMinutes,
	setSeconds,
} from "date-fns";

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
	const weekNumber = getISOWeek(weekStart);
	const weekParity = weekNumber % 2 === 0 ? LessonWeek.even : LessonWeek.odd;

	return lessons
		.filter(lesson => {
			if (lesson.lessonWeek === LessonWeek.every) return true;
			return lesson.lessonWeek === weekParity;
		})
		.map(lesson => {
			const dayName = lesson.dailySchedule!.day.toLowerCase();
			const dayOffset = DAY_TO_INDEX_MAP[dayName];

			// Calculate target date based on the week start (assuming week starts Monday)
			// Sunday (0) should map to the last day of the week
			const targetDate = addDays(weekStart, dayOffset === 0 ? 6 : dayOffset - 1);

			const startObj = new Date(lesson.startTime);
			const endObj = new Date(lesson.endTime);

			const start = setSeconds(
				setMinutes(
					setHours(targetDate, startObj.getUTCHours()),
					startObj.getUTCMinutes()
				),
				0
			);
			const end = setSeconds(
				setMinutes(
					setHours(targetDate, endObj.getUTCHours()),
					endObj.getUTCMinutes()
				),
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
