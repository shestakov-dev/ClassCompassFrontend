import {
	type UserEntity,
	type LessonsControllerFindFilteredParams,
} from "@/api/generated/models";
import { getDay, getISOWeek } from "date-fns";
import { Day, LessonWeek, DAY_INDEX_TO_DAY } from "@/types/schedule";

export const getCurrentDayEnum = (date: Date = new Date()): Day => {
	return DAY_INDEX_TO_DAY[getDay(date)];
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
