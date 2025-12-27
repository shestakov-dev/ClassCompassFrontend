import {
	LessonsControllerFindFilteredDay as Day,
	LessonsControllerFindFilteredWeek as LessonWeek,
} from "@/api/generated/models";

export { Day, LessonWeek };

export type ScheduleMode = "weekly" | "date";
export type TimeSubMode = "full-day" | "timestamp" | "range";

export const DAY_INDEX_TO_DAY: Record<number, Day> = {
	0: Day.sunday,
	1: Day.monday,
	2: Day.tuesday,
	3: Day.wednesday,
	4: Day.thursday,
	5: Day.friday,
	6: Day.saturday,
};

export const DAY_TO_DAY_INDEX: Record<Day, number> = {
	[Day.sunday]: 0,
	[Day.monday]: 1,
	[Day.tuesday]: 2,
	[Day.wednesday]: 3,
	[Day.thursday]: 4,
	[Day.friday]: 5,
	[Day.saturday]: 6,
};

export const ALL_DAYS = [
	Day.monday,
	Day.tuesday,
	Day.wednesday,
	Day.thursday,
	Day.friday,
	Day.saturday,
	Day.sunday,
];
