import {
	type UserEntity,
	type LessonsControllerFindFilteredParams,
	type LessonEntity,
} from "@/api/generated/models";
import {
	addDays,
	format,
	getDay,
	getISOWeek,
	isValid,
	parseISO,
	set,
} from "date-fns";
import { UTCDate } from "@date-fns/utc";
import {
	Day,
	LessonWeek,
	DAY_INDEX_TO_DAY,
	DAY_TO_DAY_INDEX,
	type ScheduleSearchParams,
	type ScheduleEvent,
} from "@/types/schedule";

export function formatFlatTime(isoString: string | Date): string {
	const safeDate = new UTCDate(isoString);

	return format(safeDate, "HH:mm");
}

export function createFlatDate(timeString: string): Date {
	const [hours, minutes] = timeString.split(":").map(Number);

	return new UTCDate(1970, 0, 1, hours, minutes, 0, 0);
}

export const getCurrentDayEnum = (date: Date = new Date()): Day => {
	return DAY_INDEX_TO_DAY[getDay(date)];
};

export const getWeekParity = (date: Date): LessonWeek => {
	const weekNumber = getISOWeek(date);
	return weekNumber % 2 === 0 ? LessonWeek.even : LessonWeek.odd;
};

export function transformLessonsToEvents(
	lessons: LessonEntity[],
	weekStart: Date
): ScheduleEvent[] {
	return lessons.map(lesson => {
		const dayName = lesson.dailySchedule?.day ?? Day.monday;
		const dayOffset = DAY_TO_DAY_INDEX[dayName];
		const daysToAdd = dayOffset === 0 ? 6 : dayOffset - 1;
		const targetDate = addDays(weekStart, daysToAdd);

		const startTime = parseISO(lesson.startTime);
		const endTime = parseISO(lesson.endTime);

		return {
			id: lesson.id,
			start: set(targetDate, {
				hours: startTime.getHours(),
				minutes: startTime.getMinutes(),
			}),
			end: set(targetDate, {
				hours: endTime.getHours(),
				minutes: endTime.getMinutes(),
			}),
			subject: lesson.subject?.name ?? "Unknown Subject",
			room: lesson.room?.name ?? "Unknown Room",
			teacher: lesson.teacher?.user
				? `${lesson.teacher.user.firstName} ${lesson.teacher.user.lastName}`
				: "Unknown Teacher",
			type: lesson.lessonWeek,
		};
	});
}

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

export const buildScheduleFilters = (
	user: UserEntity | null,
	search: ScheduleSearchParams
): LessonsControllerFindFilteredParams => {
	const defaults = getDefaultFilters(user);
	const mode = search.mode ?? "weekly";

	const applyDefaults =
		!search.showAll &&
		!search.classId &&
		!search.teacherId &&
		!search.roomId;

	const base: LessonsControllerFindFilteredParams = applyDefaults
		? { ...defaults }
		: {};

	if (search.classId) base.classId = search.classId;
	if (search.teacherId) base.teacherId = search.teacherId;
	if (search.subjectId) base.subjectId = search.subjectId;
	if (search.roomId) base.roomId = search.roomId;
	if (search.ignoreWeek !== undefined) base.ignoreWeek = search.ignoreWeek;

	if (mode === "date") {
		const targetDate = search.date ? parseISO(search.date) : new Date();

		const safeDate = isValid(targetDate) ? targetDate : new Date();

		if (search.timestamp) {
			// The backend derives day-of-week and week parity from the date portion,
			// so we only need to forward the timestamp and ignoreWeek.
			base.timestamp = search.timestamp;

			base.from = undefined;
			base.to = undefined;
		} else if (search.from && search.to) {
			// The backend derives day-of-week and week parity from from's date portion.
			base.from = search.from;
			base.to = search.to;

			base.timestamp = undefined;
		} else {
			// Full-day date mode
			// Use search.day directly — it was set from the user's local date
			// when they navigated, so it correctly reflects their calendar day.
			base.day = search.day ?? getCurrentDayEnum();

			// For week parity, getISOWeek on a UTCDate gives the correct ISO
			// week number for the chosen calendar date.
			base.week = search.ignoreWeek
				? undefined
				: getWeekParity(new UTCDate(safeDate));

			base.timestamp = undefined;
			base.from = undefined;
			base.to = undefined;
		}
	} else {
		// Weekly mode: show all lessons for a given day (and optionally a specific
		// week parity).
		base.day = search.day ?? base.day ?? getCurrentDayEnum();
		base.week = search.week ?? base.week;

		base.timestamp = undefined;
		base.from = undefined;
		base.to = undefined;
	}

	return base;
};

export const isScheduleDefaultFilter = (
	user: UserEntity | null,
	filters: LessonsControllerFindFilteredParams,
	search: ScheduleSearchParams
): boolean => {
	if (search.mode !== "weekly" && search.mode !== undefined) return false;
	if (search.showAll) return false;

	const defaults = getDefaultFilters(user);

	const keysToCheck: (keyof LessonsControllerFindFilteredParams)[] = [
		"classId",
		"teacherId",
		"roomId",
		"subjectId",
		"ignoreWeek",
		"day",
		"week",
	];

	for (const key of keysToCheck) {
		if (filters[key] !== defaults[key]) {
			return false;
		}
	}

	return true;
};

export const createLessonFilters = (
	timestamp: Date,
	ignoreWeek: boolean = false
): LessonsControllerFindFilteredParams => {
	const day = getCurrentDayEnum(timestamp);

	const week = ignoreWeek ? undefined : getWeekParity(timestamp);

	return {
		day,
		week,
		ignoreWeek,
		timestamp: new UTCDate(
			timestamp.getFullYear(),
			timestamp.getMonth(),
			timestamp.getDate(),
			timestamp.getHours(),
			timestamp.getMinutes()
		).toISOString(),
	};
};
