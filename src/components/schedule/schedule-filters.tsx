import {
	Filter,
	X,
	Calendar as CalendarIcon,
	ChevronsUpDown,
	CalendarDays,
	CalendarRange,
	Clock,
} from "lucide-react";
import { set } from "date-fns";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectLabel,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { DatePicker } from "@/components/date-picker";

import {
	type LessonsControllerFindFilteredParams,
	type ClassEntity,
	type SubjectEntity,
	type TeacherEntity,
	type BuildingEntity,
} from "@/api/generated/models";
import {
	useState,
	type Dispatch,
	type SetStateAction,
	type MouseEvent,
} from "react";
import { getCurrentDayEnum, getWeekParity } from "@/lib/schedule-defaults";
import {
	Day,
	LessonWeek,
	type ScheduleMode,
	type TimeSubMode,
} from "@/types/schedule";

export interface FilterOptions {
	classes?: ClassEntity[];
	subjects?: SubjectEntity[];
	teachers?: TeacherEntity[];
	buildings?: BuildingEntity[];
}

interface ScheduleFiltersProps {
	date: Date;
	setDate: (date: Date) => void;
	filters: LessonsControllerFindFilteredParams;
	setFilters: Dispatch<SetStateAction<LessonsControllerFindFilteredParams>>;
	mode: ScheduleMode;
	setMode: (mode: ScheduleMode) => void;
	genericDay: Day;
	setGenericDay: (day: Day) => void;
	onReset?: () => void;
	showReset?: boolean;
	options?: FilterOptions;
	className?: string;
}

export function ScheduleFilters({
	date,
	setDate,
	filters,
	setFilters,
	mode,
	setMode,
	genericDay,
	setGenericDay,
	onReset,
	showReset = true,
	options = {},
	className,
}: ScheduleFiltersProps) {
	const [isOpen, setIsOpen] = useState(false);
	const [timeSubMode, setTimeSubMode] = useState<TimeSubMode>("full-day");
	const [atTime, setAtTime] = useState("08:00");
	const [rangeStart, setRangeStart] = useState("08:00");
	const [rangeEnd, setRangeEnd] = useState("17:00");
	const [genericWeek, setGenericWeek] = useState<LessonWeek>(
		LessonWeek.every
	);

	const computeParams = (
		targetMode: ScheduleMode,
		targetTimeSubMode: TimeSubMode,
		targetAtTime: string,
		targetRangeStart: string,
		targetRangeEnd: string,
		targetGenericDay: Day,
		targetGenericWeek: LessonWeek,
		targetDate: Date
	): LessonsControllerFindFilteredParams => {
		const nextParams: LessonsControllerFindFilteredParams = {
			classId: filters.classId,
			teacherId: filters.teacherId,
			subjectId: filters.subjectId,
			roomId: filters.roomId,
		};

		if (targetMode === "date") {
			nextParams.ignoreWeek = filters.ignoreWeek;

			if (targetTimeSubMode === "full-day") {
				nextParams.day = getCurrentDayEnum(targetDate);
				nextParams.week = filters.ignoreWeek
					? undefined
					: getWeekParity(targetDate);

				nextParams.timestamp = undefined;
				nextParams.from = undefined;
				nextParams.to = undefined;
			} else if (targetTimeSubMode === "timestamp" && targetAtTime) {
				const [hours, minutes] = targetAtTime.split(":").map(Number);
				const dateWithTime = set(targetDate, {
					hours,
					minutes,
					seconds: 0,
					milliseconds: 0,
				});

				nextParams.timestamp = dateWithTime.toISOString();

				nextParams.from = undefined;
				nextParams.to = undefined;
				nextParams.day = undefined;
				nextParams.week = undefined;
			} else if (
				targetTimeSubMode === "range" &&
				targetRangeStart &&
				targetRangeEnd
			) {
				const [startHour, startMinute] = targetRangeStart
					.split(":")
					.map(Number);
				const [endHour, endMinute] = targetRangeEnd
					.split(":")
					.map(Number);

				const fromDate = set(targetDate, {
					hours: startHour,
					minutes: startMinute,
					seconds: 0,
					milliseconds: 0,
				});
				const toDate = set(targetDate, {
					hours: endHour,
					minutes: endMinute,
					seconds: 0,
					milliseconds: 0,
				});

				nextParams.from = fromDate.toISOString();
				nextParams.to = toDate.toISOString();

				nextParams.timestamp = undefined;
				nextParams.day = undefined;
				nextParams.week = undefined;
			}
		} else {
			nextParams.day = targetGenericDay;
			nextParams.week =
				targetGenericWeek === LessonWeek.every
					? undefined
					: targetGenericWeek;

			nextParams.timestamp = undefined;
			nextParams.from = undefined;
			nextParams.to = undefined;
			nextParams.ignoreWeek = undefined;
		}

		return nextParams;
	};

	const updateFilters = (
		changes: Partial<{
			timeSubMode: TimeSubMode;
			atTime: string;
			rangeStart: string;
			rangeEnd: string;
			genericWeek: LessonWeek;
			genericDay: Day;
			mode: ScheduleMode;
		}>
	) => {
		const newTimeSubMode = changes.timeSubMode ?? timeSubMode;
		const newAtTime = changes.atTime ?? atTime;
		const newRangeStart = changes.rangeStart ?? rangeStart;
		const newRangeEnd = changes.rangeEnd ?? rangeEnd;
		const newGenericWeek = changes.genericWeek ?? genericWeek;
		let newGenericDay = changes.genericDay ?? genericDay;
		const newMode = changes.mode ?? mode;

		if (changes.timeSubMode) setTimeSubMode(changes.timeSubMode);
		if (changes.atTime) setAtTime(changes.atTime);
		if (changes.rangeStart) setRangeStart(changes.rangeStart);
		if (changes.rangeEnd) setRangeEnd(changes.rangeEnd);
		if (changes.genericWeek) setGenericWeek(changes.genericWeek);
		if (changes.genericDay) setGenericDay(changes.genericDay);
		if (changes.mode) setMode(changes.mode);

		if (changes.mode === "weekly") {
			const derivedDay = getCurrentDayEnum(date);

			setGenericDay(derivedDay);
			newGenericDay = derivedDay;
		}

		const newParameters = computeParams(
			newMode,
			newTimeSubMode,
			newAtTime,
			newRangeStart,
			newRangeEnd,
			newGenericDay,
			newGenericWeek,
			date
		);

		setFilters(previousFilters => ({
			...previousFilters,
			...newParameters,
		}));
	};

	const handleTimeSubModeChange = (value: string) =>
		updateFilters({ timeSubMode: value as TimeSubMode });
	const handleAtTimeChange = (event: React.ChangeEvent<HTMLInputElement>) =>
		updateFilters({ atTime: event.target.value });
	const handleRangeStartChange = (
		event: React.ChangeEvent<HTMLInputElement>
	) => updateFilters({ rangeStart: event.target.value });
	const handleRangeEndChange = (event: React.ChangeEvent<HTMLInputElement>) =>
		updateFilters({ rangeEnd: event.target.value });
	const handleGenericWeekChange = (value: string) =>
		updateFilters({ genericWeek: value as LessonWeek });
	const handleGenericDayChange = (value: string) => {
		setGenericDay(value as Day);
		updateFilters({ genericDay: value as Day });
	};
	const handleModeChange = (value: string) =>
		updateFilters({ mode: value as ScheduleMode });

	const handleEntityChange = (
		key: keyof LessonsControllerFindFilteredParams,
		value: string
	) => {
		setFilters(previous => {
			const next = { ...previous, [key]: value };

			if (value === "all") {
				next[key] = undefined;
			}

			return next;
		});
	};

	const toggleIgnoreWeek = (checked: boolean) => {
		setFilters(prev => ({ ...prev, ignoreWeek: checked }));
	};

	const clearFilters = (event: MouseEvent<HTMLButtonElement>) => {
		event.stopPropagation();
		setTimeSubMode("full-day");
		setAtTime("08:00");
		setGenericWeek(LessonWeek.every);
		if (onReset) onReset();
	};

	const activeCount = Object.entries(filters).filter(
		([key, value]) =>
			key !== "ignoreWeek" && value !== undefined && value !== null
	).length;

	return (
		<Collapsible
			open={isOpen}
			onOpenChange={setIsOpen}
			className={cn(
				"w-full border rounded-md bg-card shadow-sm transition-all",
				className
			)}>
			<div className="flex items-center justify-between p-3 px-4">
				<div className="flex items-center gap-4">
					<CollapsibleTrigger asChild>
						<Button
							variant="ghost"
							size="sm"
							className="p-0 hover:bg-transparent h-auto font-semibold">
							<span className="flex items-center gap-2">
								<Filter className="h-4 w-4 text-muted-foreground" />
								<span>Filters</span>
								{activeCount > 0 && (
									<Badge
										variant="secondary"
										className="h-5 px-1.5 text-[10px]">
										{activeCount} active
									</Badge>
								)}
								<ChevronsUpDown className="h-3 w-3 text-muted-foreground opacity-50" />
							</span>
						</Button>
					</CollapsibleTrigger>
					{!isOpen && (
						<div className="hidden sm:flex items-center text-xs text-muted-foreground gap-2">
							<Separator orientation="vertical" className="h-4" />
							{mode === "date" ? (
								<span className="flex items-center gap-1">
									<CalendarIcon className="h-3 w-3" />
									{date.toLocaleDateString()}
								</span>
							) : (
								<span className="capitalize flex items-center gap-1">
									<CalendarRange className="h-3 w-3" />
									Every {genericDay} (
									{genericWeek === LessonWeek.every
										? "All"
										: genericWeek}{" "}
									Weeks)
								</span>
							)}
						</div>
					)}
				</div>
				{showReset && onReset && (
					<Button
						variant="ghost"
						size="sm"
						onClick={clearFilters}
						className="h-6 px-2 text-xs text-muted-foreground hover:text-destructive transition-colors">
						Reset <X className="ml-1 h-3 w-3" />
					</Button>
				)}
			</div>

			<CollapsibleContent>
				<div className="px-4 pb-4 space-y-6">
					<Separator />
					<div className="space-y-4">
						<Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
							View Mode
						</Label>
						<Tabs
							value={mode}
							onValueChange={handleModeChange}
							className="w-full">
							<TabsList className="w-full grid grid-cols-2">
								<TabsTrigger
									value="weekly"
									className="flex items-center gap-2">
									<CalendarRange className="h-4 w-4" /> Weekly
									Schedule
								</TabsTrigger>
								<TabsTrigger
									value="date"
									className="flex items-center gap-2">
									<CalendarDays className="h-4 w-4" />{" "}
									Specific Date
								</TabsTrigger>
							</TabsList>
						</Tabs>
					</div>

					<div className="grid gap-6 sm:grid-cols-1 lg:grid-cols-2">
						{mode === "date" ? (
							<div className="space-y-3">
								<Label className="text-xs font-medium">
									Date & Time
								</Label>
								<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
									<div className="space-y-1">
										<Label className="text-xs text-muted-foreground">
											Date
										</Label>
										<DatePicker
											date={date}
											setDate={setDate}
											className="w-full h-9"
										/>
									</div>
									<div className="space-y-1">
										<Label className="text-xs text-muted-foreground">
											Detail Level
										</Label>
										<Select
											value={timeSubMode}
											onValueChange={
												handleTimeSubModeChange
											}>
											<SelectTrigger className="h-9">
												<SelectValue />
											</SelectTrigger>
											<SelectContent>
												<SelectItem value="full-day">
													Full Day
												</SelectItem>
												<SelectItem value="timestamp">
													Specific Time
												</SelectItem>
												<SelectItem value="range">
													Time Range
												</SelectItem>
											</SelectContent>
										</Select>
									</div>
								</div>
							</div>
						) : (
							<div className="space-y-3">
								<Label className="text-xs font-medium">
									Recurring Settings
								</Label>
								<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
									<div className="space-y-1">
										<Label className="text-xs text-muted-foreground">
											Day of Week
										</Label>
										<Select
											value={genericDay}
											onValueChange={
												handleGenericDayChange
											}>
											<SelectTrigger className="h-9 capitalize">
												<SelectValue />
											</SelectTrigger>
											<SelectContent>
												{Object.values(Day).map(
													dayValue => (
														<SelectItem
															key={dayValue}
															value={dayValue}
															className="capitalize">
															{dayValue}
														</SelectItem>
													)
												)}
											</SelectContent>
										</Select>
									</div>
									<div className="space-y-1">
										<Label className="text-xs text-muted-foreground">
											Week Type
										</Label>
										<Select
											value={genericWeek}
											onValueChange={
												handleGenericWeekChange
											}>
											<SelectTrigger className="h-9 capitalize">
												<SelectValue />
											</SelectTrigger>
											<SelectContent>
												<SelectItem
													value={LessonWeek.every}>
													All Weeks
												</SelectItem>
												<SelectItem
													value={LessonWeek.odd}>
													Odd Weeks
												</SelectItem>
												<SelectItem
													value={LessonWeek.even}>
													Even Weeks
												</SelectItem>
											</SelectContent>
										</Select>
									</div>
								</div>
							</div>
						)}

						{mode === "date" && (
							<div className="flex items-center justify-start sm:justify-end pt-8">
								<div className="flex items-center space-x-2 bg-muted/30 p-2 rounded-md border border-dashed">
									<Switch
										id="ignore-week"
										checked={filters.ignoreWeek ?? false}
										onCheckedChange={toggleIgnoreWeek}
									/>
									<Label
										htmlFor="ignore-week"
										className="text-xs font-normal cursor-pointer">
										Show all weeks (ignore odd/even)
									</Label>
								</div>
							</div>
						)}
					</div>

					{mode === "date" && timeSubMode !== "full-day" && (
						<div className="bg-muted/30 p-3 rounded-md border border-dashed">
							<div className="flex flex-wrap items-end gap-4">
								<Clock className="h-4 w-4 text-muted-foreground mb-2.5" />
								{timeSubMode === "timestamp" && (
									<div className="space-y-1">
										<Label className="text-xs">
											At Time
										</Label>
										<Input
											type="time"
											value={atTime}
											onChange={handleAtTimeChange}
											className="h-8 w-32"
										/>
									</div>
								)}
								{timeSubMode === "range" && (
									<>
										<div className="space-y-1">
											<Label className="text-xs">
												From
											</Label>
											<Input
												type="time"
												value={rangeStart}
												onChange={
													handleRangeStartChange
												}
												className="h-8 w-32"
											/>
										</div>
										<div className="space-y-1">
											<Label className="text-xs">
												To
											</Label>
											<Input
												type="time"
												value={rangeEnd}
												onChange={handleRangeEndChange}
												className="h-8 w-32"
											/>
										</div>
									</>
								)}
							</div>
						</div>
					)}

					<Separator />

					<div className="space-y-3">
						<Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
							Refine Results
						</Label>

						<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
							<div className="space-y-1">
								<Label className="text-xs">Class</Label>
								<Select
									value={filters.classId ?? "all"}
									onValueChange={value =>
										handleEntityChange("classId", value)
									}>
									<SelectTrigger className="h-9">
										<SelectValue placeholder="All Classes" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="all">
											All Classes
										</SelectItem>
										{options.classes?.map(item => (
											<SelectItem
												key={item.id}
												value={item.id}>
												{item.name}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>
							<div className="space-y-1">
								<Label className="text-xs">Subject</Label>
								<Select
									value={filters.subjectId ?? "all"}
									onValueChange={value =>
										handleEntityChange("subjectId", value)
									}>
									<SelectTrigger className="h-9">
										<SelectValue placeholder="All Subjects" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="all">
											All Subjects
										</SelectItem>
										{options.subjects?.map(item => (
											<SelectItem
												key={item.id}
												value={item.id}>
												{item.name}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>
							<div className="space-y-1">
								<Label className="text-xs">Teacher</Label>
								<Select
									value={filters.teacherId ?? "all"}
									onValueChange={value =>
										handleEntityChange("teacherId", value)
									}>
									<SelectTrigger className="h-9">
										<SelectValue placeholder="All Teachers" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="all">
											All Teachers
										</SelectItem>
										{options.teachers?.map(item => (
											<SelectItem
												key={item.id}
												value={item.id}>
												{`${item.user?.firstName} ${item.user?.lastName}`}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>
							<div className="space-y-1">
								<Label className="text-xs">Room</Label>
								<Select
									value={filters.roomId ?? "all"}
									onValueChange={value =>
										handleEntityChange("roomId", value)
									}>
									<SelectTrigger className="h-9">
										<SelectValue placeholder="All Rooms" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="all">
											All Rooms
										</SelectItem>
										{options.buildings?.map(building => (
											<SelectGroup key={building.id}>
												<SelectLabel>
													{building.name}
												</SelectLabel>
												{building.floors?.map(floor =>
													floor.rooms?.map(room => (
														<SelectItem
															key={room.id}
															value={room.id}>
															{room.name} (Floor{" "}
															{floor.number})
														</SelectItem>
													))
												)}
											</SelectGroup>
										))}
									</SelectContent>
								</Select>
							</div>
						</div>
					</div>
				</div>
			</CollapsibleContent>
		</Collapsible>
	);
}
