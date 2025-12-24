import { useState, useCallback, useEffectEvent } from "react";
import { DailyScheduleViewer } from "@/components/daily-schedule-viewer";
import {
	ScheduleFilters,
	type FilterMode,
} from "@/components/schedule-filters";
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
import { addDays, subDays, getDay } from "date-fns";
import { useSession } from "@/context/session-context";
import { useLessonsControllerFindFiltered } from "@/api/generated/endpoints/lessons/lessons";
import {
	type LessonsControllerFindFilteredParams,
	LessonsControllerFindFilteredDay as Day,
} from "@/api/generated/models";

// Helper to map JS Day index to Enum
const JS_DAY_TO_ENUM: Record<number, Day> = {
	0: Day.sunday,
	1: Day.monday,
	2: Day.tuesday,
	3: Day.wednesday,
	4: Day.thursday,
	5: Day.friday,
	6: Day.saturday,
};

// Explicit days array ensures dropdown renders even if Day type behavior varies
const DAYS_OF_WEEK = [
	Day.monday,
	Day.tuesday,
	Day.wednesday,
	Day.thursday,
	Day.friday,
	Day.saturday,
	Day.sunday,
];

export default function SchedulePage() {
	const { user } = useSession();

	// --- STATE ---
	const [mode, setMode] = useState<FilterMode>("generic");
	const [currentDate, setCurrentDate] = useState(new Date());

	// Default to current day of week
	const defaultDay = JS_DAY_TO_ENUM[getDay(new Date())];
	const [genericDay, setGenericDay] = useState<Day>(defaultDay);

	const [filters, setFilters] = useState<LessonsControllerFindFilteredParams>(
		{}
	);

	// --- DEFAULT FILTER LOGIC ---
	const getDefaultFilters =
		useCallback((): LessonsControllerFindFilteredParams => {
			// Base: Current Day
			const defaults: LessonsControllerFindFilteredParams = { day: defaultDay };

			if (!user) {
				return defaults;
			}

			return defaults;
		}, [user, defaultDay]);

	// --- INITIALIZATION ---
	useEffectEvent(() => {
		if (user) {
			setFilters(getDefaultFilters());
		}
	});

	// --- RESET HANDLER ---
	const handleReset = () => {
		const defaults = getDefaultFilters();
		setFilters(defaults);

		// Reset View States
		setMode("generic");
		setGenericDay(defaults.day || defaultDay);
		setCurrentDate(new Date());
	};

	// --- DATA FETCHING ---
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

	// --- HANDLERS ---
	const handlePrevDay = () => setCurrentDate(subDays(currentDate, 1));
	const handleNextDay = () => setCurrentDate(addDays(currentDate, 1));

	const handleGenericDayChange = (day: Day) => {
		setGenericDay(day);
		setFilters(prev => ({ ...prev, day }));
	};

	return (
		<div className="flex flex-col h-full bg-background">
			<div className="flex-1 flex flex-col w-full max-w-6xl mx-auto p-4 md:p-6 gap-4 min-h-0">
				{/* --- HEADER --- */}
				<div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
					<div>
						<h1 className="text-2xl font-bold tracking-tight">Schedule</h1>
						<p className="text-muted-foreground text-sm">
							View your upcoming classes.
						</p>
					</div>

					{/* --- CONTROLS --- */}
					<div className="flex items-center gap-2 self-start md:self-auto">
						{mode === "calendar" ? (
							// Calendar Mode: Arrow Navigation
							<div className="flex items-center gap-1 bg-card border rounded-lg p-1 shadow-sm">
								<Button
									variant="ghost"
									size="icon"
									onClick={handlePrevDay}
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
									onClick={handleNextDay}
									className="h-8 w-8 hover:bg-muted hover:text-foreground">
									<ChevronRight className="h-4 w-4" />
								</Button>
							</div>
						) : (
							// Generic Mode: Day Dropdown
							<div className="bg-card border rounded-lg p-1 shadow-sm">
								<Select
									value={genericDay}
									onValueChange={handleGenericDayChange}>
									<SelectTrigger className="h-8 w-35 border-none shadow-none font-semibold focus:ring-0">
										<div className="flex items-center gap-2">
											<CalendarRange className="h-4 w-4 text-muted-foreground" />
											<SelectValue
												placeholder="Select Day"
												className="capitalize"
											/>
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

				{/* --- FILTERS --- */}
				<div className="shrink-0">
					<ScheduleFilters
						date={currentDate}
						setDate={setCurrentDate}
						filters={filters}
						setFilters={setFilters}
						mode={mode}
						setMode={setMode}
						genericDay={genericDay}
						setGenericDay={handleGenericDayChange}
						onReset={handleReset}
					/>
				</div>

				{/* --- CALENDAR BODY --- */}
				<div className="flex-1 min-h-0 flex flex-col relative mt-2">
					{isLoading ? (
						<div className="absolute inset-0 flex items-center justify-center">
							<Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
						</div>
					) : (
						<DailyScheduleViewer
							lessons={lessons ?? []}
							date={mode === "calendar" ? currentDate : new Date()}
						/>
					)}
				</div>
			</div>
		</div>
	);
}
