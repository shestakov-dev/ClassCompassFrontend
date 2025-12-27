import { useCallback, useMemo } from "react";
import { DailyScheduleViewer } from "@/components/schedule/daily-schedule-viewer";
import { ScheduleFilters } from "@/components/schedule/schedule-filters";
import { Button } from "@/components/ui/button";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import {
	ChevronLeft,
	ChevronRight,
	CalendarRange,
	CalendarX2,
} from "lucide-react";
import { addDays, subDays, setDay, parseISO, set } from "date-fns";
import { useSession } from "@/context/session-context";
import { useLessonsControllerFindFiltered } from "@/api/generated/endpoints/lessons/lessons";
import { useClassesControllerFindAllBySchool } from "@/api/generated/endpoints/classes/classes";
import { useSubjectsControllerFindAllBySchool } from "@/api/generated/endpoints/subjects/subjects";
import { useTeachersControllerFindAllBySchool } from "@/api/generated/endpoints/teachers/teachers";
import { useBuildingsControllerFindAllBySchool } from "@/api/generated/endpoints/buildings/buildings";
import { type LessonsControllerFindFilteredParams } from "@/api/generated/models";
import { Day, ALL_DAYS, DAY_TO_DAY_INDEX } from "@/types/schedule";
import {
	buildScheduleFilters,
	getCurrentDayEnum,
	isScheduleDefaultFilter,
} from "@/lib/schedule-utils";
import { keepPreviousData } from "@tanstack/react-query";
import { Route } from "@/routes/schedule";
import {
	Empty,
	EmptyContent,
	EmptyDescription,
	EmptyHeader,
	EmptyMedia,
	EmptyTitle,
} from "@/components/ui/empty";
import { cn } from "@/lib/utils";
import { LessonListView } from "@/components/schedule/lesson-list-view";

export default function SchedulePage() {
	const { user } = useSession();

	const navigate = Route.useNavigate();
	const search = Route.useSearch();

	const mode = search.mode ?? "weekly";
	const currentDate = useMemo(
		() => (search.date ? parseISO(search.date) : new Date()),
		[search.date]
	);
	const genericDay = search.day ?? getCurrentDayEnum();

	const filters = useMemo(() => {
		return buildScheduleFilters(user, search);
	}, [search, user]);

	const isDefaultFilters = useMemo(() => {
		return isScheduleDefaultFilter(user, filters, search);
	}, [user, filters, search]);

	const {
		data: lessons,
		isLoading,
		isFetching,
	} = useLessonsControllerFindFiltered(user?.schoolId ?? "", filters, {
		query: {
			enabled: !!user?.schoolId,
			staleTime: 1000 * 60 * 1,
			placeholderData: keepPreviousData,
		},
	});

	const { data: classes } = useClassesControllerFindAllBySchool(
		user?.schoolId ?? "",
		{ query: { enabled: !!user?.schoolId, staleTime: 1000 * 60 * 1 } }
	);
	const { data: subjects } = useSubjectsControllerFindAllBySchool(
		user?.schoolId ?? "",
		{ query: { enabled: !!user?.schoolId, staleTime: 1000 * 60 * 1 } }
	);
	const { data: teachers } = useTeachersControllerFindAllBySchool(
		user?.schoolId ?? "",
		{ query: { enabled: !!user?.schoolId, staleTime: 1000 * 60 * 1 } }
	);
	const { data: buildings } = useBuildingsControllerFindAllBySchool(
		user?.schoolId ?? "",
		{ query: { enabled: !!user?.schoolId, staleTime: 1000 * 60 * 1 } }
	);

	const hasLessons = lessons && lessons.length > 0;
	const showSkeleton = isLoading || (isFetching && !lessons);

	const updateSearch = useCallback(
		(newParams: Partial<typeof search>) => {
			navigate({
				search: prev => ({ ...prev, ...newParams }),
				replace: true,
			});
		},
		[navigate]
	);

	const handleDateChange = useCallback(
		(newDate: Date) => {
			const dayEnum = getCurrentDayEnum(newDate);
			const updates: Partial<typeof search> = {
				date: newDate.toISOString(),
				day: dayEnum,
			};

			if (search.timestamp) {
				const oldTs = parseISO(search.timestamp);
				updates.timestamp = set(newDate, {
					hours: oldTs.getHours(),
					minutes: oldTs.getMinutes(),
				}).toISOString();
			}

			if (search.from && search.to) {
				const oldFrom = parseISO(search.from);
				const oldTo = parseISO(search.to);
				updates.from = set(newDate, {
					hours: oldFrom.getHours(),
					minutes: oldFrom.getMinutes(),
				}).toISOString();
				updates.to = set(newDate, {
					hours: oldTo.getHours(),
					minutes: oldTo.getMinutes(),
				}).toISOString();
			}

			updateSearch(updates);
		},
		[updateSearch, search]
	);

	const handleGenericDayChange = useCallback(
		(day: Day) => {
			const dayIndex = DAY_TO_DAY_INDEX[day];

			let newDateStr = undefined;
			if (!isNaN(dayIndex)) {
				const newDate = setDay(currentDate, dayIndex, {
					weekStartsOn: 1,
				});
				newDateStr = newDate.toISOString();
			}

			updateSearch({
				day,
				date: newDateStr,
			});
		},
		[currentDate, updateSearch]
	);

	const handleReset = useCallback(() => {
		const now = new Date();
		navigate({
			search: () => ({
				mode: "weekly",
				date: now.toISOString(),
				showAll: undefined,
				classId: undefined,
				teacherId: undefined,
				subjectId: undefined,
				roomId: undefined,
				week: undefined,
				ignoreWeek: undefined,
				timestamp: undefined,
				from: undefined,
				to: undefined,
				day: undefined,
			}),
			replace: true,
		});
	}, [navigate]);

	const handleSetFilters = useCallback(
		(
			updater:
				| LessonsControllerFindFilteredParams
				| ((
						prev: LessonsControllerFindFilteredParams
				  ) => LessonsControllerFindFilteredParams)
		) => {
			const nextFilters =
				typeof updater === "function" ? updater(filters) : updater;
			updateSearch(nextFilters);
		},
		[filters, updateSearch]
	);

	const isSingularResource = useMemo(() => {
		return !!(filters.classId || filters.teacherId || filters.roomId);
	}, [filters]);

	return (
		<div className="flex flex-col h-full bg-background">
			<div className="flex-1 flex flex-col w-full max-w-6xl mx-auto p-4 md:p-6 gap-4 min-h-0">
				<div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
					<div>
						<div className="flex items-center gap-3">
							<h1 className="text-2xl font-bold tracking-tight">
								Schedule
							</h1>
							{isFetching && !isLoading && (
								<Spinner className="text-muted-foreground transition-opacity" />
							)}
						</div>
						<p className="text-muted-foreground text-sm">
							View your upcoming classes.
						</p>
					</div>

					<div className="flex items-center gap-2 self-start md:self-auto">
						{mode === "date" ? (
							<div className="flex items-center gap-1 bg-card border rounded-lg p-1 shadow-sm">
								<Button
									variant="ghost"
									size="icon"
									onClick={() =>
										handleDateChange(
											subDays(currentDate, 1)
										)
									}
									className="h-8 w-8 hover:bg-muted hover:text-foreground">
									<ChevronLeft className="h-4 w-4" />
								</Button>

								<div className="px-3 text-sm font-semibold min-w-28 text-center">
									{currentDate.toLocaleDateString(undefined, {
										weekday: "short",
										month: "short",
										day: "numeric",
									})}
								</div>

								<Button
									variant="ghost"
									size="icon"
									onClick={() =>
										handleDateChange(
											addDays(currentDate, 1)
										)
									}
									className="h-8 w-8 hover:bg-muted hover:text-foreground">
									<ChevronRight className="h-4 w-4" />
								</Button>
							</div>
						) : (
							<div className="bg-card border rounded-lg p-1 shadow-sm">
								<Select
									value={genericDay}
									onValueChange={handleGenericDayChange}>
									<SelectTrigger className="h-8 min-w-36 border-none shadow-none font-semibold focus:ring-0">
										<div className="flex items-center gap-2">
											<CalendarRange className="h-4 w-4 text-muted-foreground" />
											<SelectValue placeholder="Select Day">
												<span className="capitalize">
													{genericDay}
												</span>
											</SelectValue>
										</div>
									</SelectTrigger>
									<SelectContent align="end">
										{ALL_DAYS.map(dayOption => (
											<SelectItem
												key={dayOption}
												value={dayOption}>
												<span className="capitalize">
													{dayOption}
												</span>
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
						setFilters={handleSetFilters}
						mode={mode}
						setMode={newMode => updateSearch({ mode: newMode })}
						genericDay={genericDay}
						setGenericDay={handleGenericDayChange}
						onReset={handleReset}
						showReset={!isDefaultFilters}
						options={{
							classes,
							subjects,
							teachers,
							buildings,
						}}
						onClearResource={resourceKey => {
							updateSearch({
								[resourceKey]: undefined,
								showAll: true,
							});
						}}
					/>
				</div>

				<div className="flex-1 min-h-0 flex flex-col relative mt-2">
					<div
						className={cn(
							"relative h-full",
							isSingularResource &&
								"border rounded-md bg-background shadow-sm overflow-hidden"
						)}>
						{showSkeleton ? (
							<div className="absolute inset-0 z-50 bg-background/80 backdrop-blur-[1px] flex items-center justify-center animate-in fade-in duration-300">
								<div className="absolute inset-0 opacity-20 pointer-events-none grayscale">
									<DailyScheduleViewer
										lessons={[]}
										date={currentDate}
									/>
								</div>
								<div className="flex flex-col items-center gap-2 z-10">
									<Spinner className="h-8 w-8 text-primary" />
									<p className="text-xs text-muted-foreground font-medium">
										Loading schedule...
									</p>
								</div>
							</div>
						) : !hasLessons ? (
							<div className="h-full flex items-center justify-center bg-muted/5 animate-in fade-in zoom-in-95 duration-300">
								<Empty>
									<EmptyHeader>
										<EmptyMedia variant="icon">
											<CalendarX2 className="h-10 w-10 text-muted-foreground/50" />
										</EmptyMedia>
										<EmptyTitle>
											No classes found
										</EmptyTitle>
										<EmptyDescription>
											There are no classes scheduled for{" "}
											{mode === "date"
												? "this specific date and time"
												: `${genericDay.charAt(0).toUpperCase()}${genericDay.slice(1).toLowerCase()}`}{" "}
											with the current filters.
										</EmptyDescription>
									</EmptyHeader>
									<EmptyContent>
										{!isDefaultFilters && (
											<Button
												variant="outline"
												size="sm"
												onClick={handleReset}>
												Reset Filters
											</Button>
										)}
									</EmptyContent>
								</Empty>
							</div>
						) : isSingularResource ? (
							<div className="h-full animate-in fade-in duration-500">
								<DailyScheduleViewer
									lessons={lessons ?? []}
									date={currentDate}
								/>
							</div>
						) : (
							<div className="h-full overflow-auto pr-2 animate-in fade-in duration-500">
								<LessonListView
									lessons={lessons ?? []}
									currentDate={currentDate}
								/>
							</div>
						)}
					</div>
				</div>
			</div>
		</div>
	);
}
