import {
	LessonsControllerFindFilteredDay as Day,
	type LessonsControllerFindFilteredParams,
	type UserEntity,
} from "@/api/generated/models";
import { getDay } from "date-fns";

const JS_DAY_TO_ENUM: Record<number, Day> = {
	0: Day.sunday,
	1: Day.monday,
	2: Day.tuesday,
	3: Day.wednesday,
	4: Day.thursday,
	5: Day.friday,
	6: Day.saturday,
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

export const getCurrentDayEnum = (): Day => {
	return JS_DAY_TO_ENUM[getDay(new Date())];
};

export const getDefaultFilters = (
	user: UserEntity | null
): LessonsControllerFindFilteredParams => {
	const defaults: LessonsControllerFindFilteredParams = {
		day: getCurrentDayEnum(),
	};

	if (!user) return defaults;

	// Future user-specific defaults can be added here

	return defaults;
};
