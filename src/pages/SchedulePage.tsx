import { useState, useCallback, useEffectEvent } from "react";
import { DailyScheduleViewer } from "@/components/schedule/daily-schedule-viewer";
import {
	ScheduleFilters,
	type FilterMode,
} from "@/components/schedule/schedule-filters";
import { Button } from "@/components/ui/button";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	ChevronLeft,
	ChevronRight,
	Loader2,
	CalendarRange,
} from "lucide-react";
import { addDays, subDays, getDay, setDay } from "date-fns";
import { useSession } from "@/context/session-context";
import { useLessonsControllerFindFiltered } from "@/api/generated/endpoints/lessons/lessons";
import {
	type LessonsControllerFindFilteredParams,
	LessonsControllerFindFilteredDay as Day,
} from "@/api/generated/models";
import {
	DAYS_OF_WEEK,
	getCurrentDayEnum,
	getDefaultFilters,
} from "@/lib/schedule-defaults";

const JS_DAY_TO_ENUM: Record<number, Day> = {
	0: Day.sunday,
	1: Day.monday,
	2: Day.tuesday,
	3: Day.wednesday,
	4: Day.thursday,
	5: Day.friday,
	6: Day.saturday,
};

export default function SchedulePage() {
	const { user } = useSession();

	const [mode, setMode] = useState<FilterMode>("generic");
	const [currentDate, setCurrentDate] = useState(new Date());

	const defaultDay = getCurrentDayEnum();
	const [genericDay, setGenericDay] = useState<Day>(defaultDay);
	const [filters, setFilters] = useState<LessonsControllerFindFilteredParams>(
		{}
	);

	useEffectEvent(() => {
		if (user) {
			setFilters(getDefaultFilters(user));
		}
	});

	const handleReset = useCallback(() => {
		const defaults = getDefaultFilters(user);
		setFilters(defaults);

		setMode("generic");

		const now = new Date();
		setGenericDay(defaults.day || defaultDay);
		setCurrentDate(now);
	}, [user, defaultDay]);

	const { data: lessons, isLoading } = useLessonsControllerFindFiltered(
		user?.schoolId ?? "",
		filters,
		{
			query: {
				enabled: !!user?.schoolId,
				staleTime: 1000 * 60 * 1,
				placeholderData: previousData => previousData,
			},
		}
	);

	// When date changes (calendar arrow nav), update generic day to match
	const handleDateChange = (newDate: Date) => {
		setCurrentDate(newDate);

		const dayIndex = getDay(newDate);
		const dayEnum = JS_DAY_TO_ENUM[dayIndex];

		if (dayEnum) {
			setGenericDay(dayEnum);
		}
	};

	// When generic day changes (dropdown), update date to match that day in current week
	const handleGenericDayChange = (day: Day) => {
		setGenericDay(day);

		const dayIndex = Number(
			Object.keys(JS_DAY_TO_ENUM).find(key => JS_DAY_TO_ENUM[Number(key)] === day)
		);

		if (!isNaN(dayIndex)) {
			// Update currentDate to the selected day within the same week
			const newDate = setDay(currentDate, dayIndex, { weekStartsOn: 1 });
			setCurrentDate(newDate);
		}
	};

	return (
		<div className="flex flex-col h-full bg-background">
			<div className="flex-1 flex flex-col w-full max-w-6xl mx-auto p-4 md:p-6 gap-4 min-h-0">
				<div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
					<div>
						<h1 className="text-2xl font-bold tracking-tight">Schedule</h1>
						<p className="text-muted-foreground text-sm">
							View your upcoming classes.
						</p>
					</div>

					<div className="flex items-center gap-2 self-start md:self-auto">
						{mode === "calendar" ? (
							<div className="flex items-center gap-1 bg-card border rounded-lg p-1 shadow-sm">
								<Button
									variant="ghost"
									size="icon"
									onClick={() => handleDateChange(subDays(currentDate, 1))}
									className="h-8 w-8 hover:bg-muted hover:text-foreground">
									<ChevronLeft className="h-4 w-4" />
								</Button>

								<div className="px-3 text-sm font-semibold min-w-25 text-center">
									{currentDate.toLocaleDateString(undefined, {
										weekday: "short",
										month: "short",
										day: "numeric",
									})}
								</div>

								<Button
									variant="ghost"
									size="icon"
									onClick={() => handleDateChange(addDays(currentDate, 1))}
									className="h-8 w-8 hover:bg-muted hover:text-foreground">
									<ChevronRight className="h-4 w-4" />
								</Button>
							</div>
						) : (
							<div className="bg-card border rounded-lg p-1 shadow-sm">
								<Select
									value={genericDay}
									onValueChange={handleGenericDayChange}>
									<SelectTrigger className="h-8 min-w-35 border-none shadow-none font-semibold focus:ring-0">
										<div className="flex items-center gap-2">
											<CalendarRange className="h-4 w-4 text-muted-foreground" />
											<SelectValue placeholder="Select Day">
												<span className="capitalize">{genericDay}</span>
											</SelectValue>
										</div>
									</SelectTrigger>
									<SelectContent align="end">
										{DAYS_OF_WEEK.map(day => (
											<SelectItem
												key={day}
												value={day}>
												<span className="capitalize">{day}</span>
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>
						)}
					</div>
				</div>

				<div className="shrink-0">
					<ScheduleFilters
						date={currentDate}
						setDate={handleDateChange}
						filters={filters}
						setFilters={setFilters}
						mode={mode}
						setMode={setMode}
						genericDay={genericDay}
						setGenericDay={handleGenericDayChange}
						onReset={handleReset}
					/>
				</div>

				<div className="flex-1 min-h-0 flex flex-col relative mt-2">
					{isLoading ? (
						<div className="absolute inset-0 flex items-center justify-center">
							<Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
						</div>
					) : (
						<DailyScheduleViewer
							lessons={lessons ?? []}
							date={currentDate}
						/>
					)}
				</div>
			</div>
		</div>
	);
}
