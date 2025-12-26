import {
	LessonsControllerFindFilteredDay as Day,
	LessonsControllerFindFilteredWeek as LessonWeek,
	type UserEntity,
	type LessonsControllerFindFilteredParams,
} from "@/api/generated/models";
import { getDay, getISOWeek } from "date-fns";

export const JS_DAY_TO_ENUM: Record<number, Day> = {
	0: Day.sunday,
	1: Day.monday,
	2: Day.tuesday,
	3: Day.wednesday,
	4: Day.thursday,
	5: Day.friday,
	6: Day.saturday,
};

export const DAY_TO_INDEX_MAP: Record<Day, number> = {
	[Day.sunday]: 0,
	[Day.monday]: 1,
	[Day.tuesday]: 2,
	[Day.wednesday]: 3,
	[Day.thursday]: 4,
	[Day.friday]: 5,
	[Day.saturday]: 6,
};

export const DAYS_OF_WEEK = [
	Day.monday,
	Day.tuesday,
	Day.wednesday,
	Day.thursday,
	Day.friday,
	Day.saturday,
	Day.sunday,
];

export const getCurrentDayEnum = (date: Date = new Date()): Day => {
	return JS_DAY_TO_ENUM[getDay(date)];
};

export const getWeekParity = (date: Date): LessonWeek => {
	const weekNumber = getISOWeek(date);
	return weekNumber % 2 === 0 ? LessonWeek.even : LessonWeek.odd;
};

export const getDefaultFilters = (
	user: UserEntity | null
): LessonsControllerFindFilteredParams => {
	const defaults: LessonsControllerFindFilteredParams = {
		day: getCurrentDayEnum(),
	};

	if (user?.student) {
		defaults.classId = user.student.classId;
	} else if (user?.teacher) {
		defaults.teacherId = user.teacher.id;
	}

	return defaults;
};
