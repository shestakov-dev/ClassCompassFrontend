import {
	Filter,
	X,
	Calendar as CalendarIcon,
	ChevronsUpDown,
	CalendarDays,
	CalendarRange,
	Clock,
} from "lucide-react";
import { format, setHours, setMinutes, getISOWeek, getDay } from "date-fns";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
	Select,
	SelectContent,
	SelectItem,
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
	LessonsControllerFindFilteredWeek as LessonWeek,
	LessonsControllerFindFilteredDay as Day,
} from "@/api/generated/models";
import {
	useCallback,
	useEffect,
	useState,
	type Dispatch,
	type SetStateAction,
	type MouseEvent,
} from "react";

// --- HELPERS ---
const JS_DAY_TO_ENUM: Record<number, Day> = {
	0: Day.sunday,
	1: Day.monday,
	2: Day.tuesday,
	3: Day.wednesday,
	4: Day.thursday,
	5: Day.friday,
	6: Day.saturday,
};

export interface FilterOptions {
	classes?: { id: string; name: string }[];
	subjects?: { id: string; name: string }[];
	teachers?: { id: string; name: string }[];
	rooms?: { id: string; name: string }[];
}

export type FilterMode = "calendar" | "generic";

type TimeSubMode = "full-day" | "timestamp" | "range";

interface ScheduleFiltersProps {
	date: Date;
	setDate: (date: Date) => void;
	filters: LessonsControllerFindFilteredParams;
	setFilters: Dispatch<SetStateAction<LessonsControllerFindFilteredParams>>;
	mode: FilterMode;
	setMode: (mode: FilterMode) => void;
	genericDay: Day;
	setGenericDay: (day: Day) => void;
	onReset?: () => void;
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
	options = {},
	className,
}: ScheduleFiltersProps) {
	const [isOpen, setIsOpen] = useState(false);

	// --- LOCAL UI STATE ---
	const [timeSubMode, setTimeSubMode] = useState<TimeSubMode>("full-day");
	const [atTime, setAtTime] = useState("08:00");
	const [rangeStart, setRangeStart] = useState("08:00");
	const [rangeEnd, setRangeEnd] = useState("17:00");
	const [genericWeek, setGenericWeek] = useState<LessonWeek | "all">("all");

	// --- LOGIC: SYNC UI TO API PARAMS ---
	const applyFilters = useCallback(() => {
		setFilters(prev => {
			const next = { ...prev };

			// 1. Clean up mutually exclusive fields
			delete next.timestamp;
			delete next.from;
			delete next.to;
			delete next.day;
			delete next.week;

			if (mode === "calendar") {
				if (timeSubMode === "full-day") {
					const dayIndex = getDay(date);
					const weekNum = getISOWeek(date);
					next.day = JS_DAY_TO_ENUM[dayIndex];
					next.week = weekNum % 2 === 0 ? LessonWeek.even : LessonWeek.odd;
				} else if (timeSubMode === "timestamp" && atTime) {
					const [h, m] = atTime.split(":").map(Number);
					const dt = setMinutes(setHours(date, h), m);
					next.timestamp = format(dt, "yyyy-MM-dd'T'HH:mm:ss");
				} else if (timeSubMode === "range" && rangeStart && rangeEnd) {
					const [h1, m1] = rangeStart.split(":").map(Number);
					const [h2, m2] = rangeEnd.split(":").map(Number);
					const dt1 = setMinutes(setHours(date, h1), m1);
					const dt2 = setMinutes(setHours(date, h2), m2);
					next.from = format(dt1, "yyyy-MM-dd'T'HH:mm:ss");
					next.to = format(dt2, "yyyy-MM-dd'T'HH:mm:ss");
				}
			} else if (mode === "generic") {
				next.day = genericDay;
				if (genericWeek !== "all") {
					next.week = genericWeek;
				}
			}

			return next;
		});
	}, [
		mode,
		timeSubMode,
		date,
		atTime,
		rangeStart,
		rangeEnd,
		genericDay,
		genericWeek,
		setFilters,
	]);

	useEffect(() => {
		applyFilters();
	}, [applyFilters]);

	// --- HANDLERS ---
	const handleEntityChange = (
		key: keyof LessonsControllerFindFilteredParams,
		val: string
	) => {
		setFilters(p => {
			const n = { ...p, [key]: val };
			if (val === "all") delete n[key];
			return n;
		});
	};

	const toggleIgnoreWeek = (checked: boolean) => {
		setFilters(p => ({ ...p, ignoreWeek: checked }));
	};

	const clearFilters = (e: MouseEvent<HTMLButtonElement>) => {
		e.stopPropagation();

		// Reset local states
		setTimeSubMode("full-day");
		setAtTime("08:00");
		setGenericWeek("all");

		if (onReset) {
			onReset();
		} else {
			// Fallback
			setMode("generic");
			setFilters({});
		}
	};

	const activeCount = Object.keys(filters).filter(
		k => k !== "ignoreWeek"
	).length;

	return (
		<Collapsible
			open={isOpen}
			onOpenChange={setIsOpen}
			className={cn(
				"w-full border rounded-md bg-card shadow-sm transition-all",
				className
			)}>
			{/* --- HEADER --- */}
			<div className="flex items-center justify-between p-3 px-4">
				<div className="flex items-center gap-4">
					<CollapsibleTrigger asChild>
						<Button
							variant="ghost"
							size="sm"
							className="p-0 hover:bg-transparent h-auto font-semibold">
							<span className="flex items-center gap-2">
								<Filter className="h-4 w-4 text-muted-foreground" />
								<span>Refine Schedule</span>
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
							<Separator
								orientation="vertical"
								className="h-4"
							/>
							{mode === "calendar" ? (
								<span className="flex items-center gap-1">
									<CalendarIcon className="h-3 w-3" />
									{date.toLocaleDateString()}
									{timeSubMode !== "full-day" && (
										<span className="opacity-50">({timeSubMode})</span>
									)}
								</span>
							) : (
								<span className="capitalize flex items-center gap-1">
									<CalendarRange className="h-3 w-3" />
									Every {genericDay} ({genericWeek === "all" ? "All Weeks" : genericWeek}
									)
								</span>
							)}
						</div>
					)}
				</div>

				{activeCount > 0 && (
					<Button
						variant="ghost"
						size="sm"
						onClick={clearFilters}
						className="h-6 px-2 text-xs text-muted-foreground hover:text-destructive transition-colors">
						Reset
						<X className="ml-1 h-3 w-3" />
					</Button>
				)}
			</div>

			{/* --- CONTENT --- */}
			<CollapsibleContent>
				<div className="px-4 pb-4 space-y-6">
					<Separator />

					{/* 1. VIEW MODE SELECTION */}
					<div className="space-y-4">
						<Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
							View Mode
						</Label>
						<Tabs
							value={mode}
							onValueChange={v => setMode(v as FilterMode)}
							className="w-full">
							<TabsList className="w-full grid grid-cols-2">
								<TabsTrigger
									value="generic"
									className="flex items-center gap-2">
									<CalendarRange className="h-4 w-4" />
									Weekly Schedule
								</TabsTrigger>
								<TabsTrigger
									value="calendar"
									className="flex items-center gap-2">
									<CalendarDays className="h-4 w-4" />
									Specific Date
								</TabsTrigger>
							</TabsList>
						</Tabs>
					</div>

					{/* 2. MODE SPECIFIC CONTROLS */}
					<div className="grid gap-6 sm:grid-cols-1 lg:grid-cols-2">
						{mode === "calendar" ? (
							<div className="space-y-3">
								<Label className="text-xs font-medium">Date & Time</Label>
								<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
									<div className="space-y-1">
										<Label className="text-xs text-muted-foreground">Date</Label>
										<DatePicker
											date={date}
											setDate={setDate}
											className="w-full h-9"
										/>
									</div>
									<div className="space-y-1">
										<Label className="text-xs text-muted-foreground">Detail Level</Label>
										<Select
											value={timeSubMode}
											onValueChange={v => setTimeSubMode(v as TimeSubMode)}>
											<SelectTrigger className="h-9">
												<SelectValue />
											</SelectTrigger>
											<SelectContent>
												<SelectItem value="full-day">Full Day</SelectItem>
												<SelectItem value="timestamp">Specific Time</SelectItem>
												<SelectItem value="range">Time Range</SelectItem>
											</SelectContent>
										</Select>
									</div>
								</div>
							</div>
						) : (
							<div className="space-y-3">
								<Label className="text-xs font-medium">Recurring Settings</Label>
								<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
									<div className="space-y-1">
										<Label className="text-xs text-muted-foreground">Day of Week</Label>
										<Select
											value={genericDay}
											onValueChange={v => setGenericDay(v as Day)}>
											<SelectTrigger className="h-9 capitalize">
												<SelectValue />
											</SelectTrigger>
											<SelectContent>
												{Object.values(Day).map(d => (
													<SelectItem
														key={d}
														value={d}
														className="capitalize">
														{d}
													</SelectItem>
												))}
											</SelectContent>
										</Select>
									</div>
									<div className="space-y-1">
										<Label className="text-xs text-muted-foreground">Week Type</Label>
										<Select
											value={genericWeek}
											onValueChange={v => setGenericWeek(v as LessonWeek | "all")}>
											<SelectTrigger className="h-9 capitalize">
												<SelectValue />
											</SelectTrigger>
											<SelectContent>
												<SelectItem value="all">Any Week</SelectItem>
												<SelectItem value={LessonWeek.odd}>Odd Week</SelectItem>
												<SelectItem value={LessonWeek.even}>Even Week</SelectItem>
											</SelectContent>
										</Select>
									</div>
								</div>
							</div>
						)}

						{/* Ignore Week Switch (Only visible in Calendar Mode) */}
						{mode === "calendar" && (
							<div className="flex items-center justify-start sm:justify-end pt-8">
								<div className="flex items-center space-x-2 bg-muted/30 p-2 rounded-md border border-dashed">
									<Switch
										id="ignore-week"
										checked={filters.ignoreWeek || false}
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

					{/* 3. TIME INPUTS (Only for Calendar Mode + Submodes) */}
					{mode === "calendar" && timeSubMode !== "full-day" && (
						<div className="bg-muted/30 p-3 rounded-md border border-dashed">
							<div className="flex flex-wrap items-end gap-4">
								<Clock className="h-4 w-4 text-muted-foreground mb-2.5" />
								{timeSubMode === "timestamp" && (
									<div className="space-y-1">
										<Label className="text-xs">At Time</Label>
										<Input
											type="time"
											value={atTime}
											onChange={e => setAtTime(e.target.value)}
											className="h-8 w-32"
										/>
									</div>
								)}
								{timeSubMode === "range" && (
									<>
										<div className="space-y-1">
											<Label className="text-xs">From</Label>
											<Input
												type="time"
												value={rangeStart}
												onChange={e => setRangeStart(e.target.value)}
												className="h-8 w-32"
											/>
										</div>
										<div className="space-y-1">
											<Label className="text-xs">To</Label>
											<Input
												type="time"
												value={rangeEnd}
												onChange={e => setRangeEnd(e.target.value)}
												className="h-8 w-32"
											/>
										</div>
									</>
								)}
							</div>
						</div>
					)}

					<Separator />

					{/* 4. ENTITY FILTERS */}
					<div className="space-y-3">
						<Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
							Refine Results
						</Label>

						<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
							{/* Class Filter */}
							<div className="space-y-1">
								<Label className="text-xs">Class</Label>
								<Select
									value={filters.classId || "all"}
									onValueChange={v => handleEntityChange("classId", v)}>
									<SelectTrigger className="h-9">
										<SelectValue placeholder="All Classes" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="all">All Classes</SelectItem>
										{options.classes?.map(c => (
											<SelectItem
												key={c.id}
												value={c.id}>
												{c.name}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>

							{/* Subject Filter */}
							<div className="space-y-1">
								<Label className="text-xs">Subject</Label>
								<Select
									value={filters.subjectId || "all"}
									onValueChange={v => handleEntityChange("subjectId", v)}>
									<SelectTrigger className="h-9">
										<SelectValue placeholder="All Subjects" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="all">All Subjects</SelectItem>
										{options.subjects?.map(s => (
											<SelectItem
												key={s.id}
												value={s.id}>
												{s.name}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>

							{/* Teacher Filter */}
							<div className="space-y-1">
								<Label className="text-xs">Teacher</Label>
								<Select
									value={filters.teacherId || "all"}
									onValueChange={v => handleEntityChange("teacherId", v)}>
									<SelectTrigger className="h-9">
										<SelectValue placeholder="All Teachers" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="all">All Teachers</SelectItem>
										{options.teachers?.map(t => (
											<SelectItem
												key={t.id}
												value={t.id}>
												{t.name}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>

							{/* Room Filter */}
							<div className="space-y-1">
								<Label className="text-xs">Room</Label>
								<Select
									value={filters.roomId || "all"}
									onValueChange={v => handleEntityChange("roomId", v)}>
									<SelectTrigger className="h-9">
										<SelectValue placeholder="All Rooms" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="all">All Rooms</SelectItem>
										{options.rooms?.map(r => (
											<SelectItem
												key={r.id}
												value={r.id}>
												{r.name}
											</SelectItem>
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
