import {
	Filter,
	X,
	CalendarIcon,
	ChevronsUpDown,
	CalendarDays,
	CalendarRange,
	Clock,
} from "lucide-react";
import { format, set } from "date-fns";
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
import { DatePicker } from "@/components/common/date-picker";
import { type LessonsControllerFindFilteredParams } from "@/api/generated/models";
import {
	useState,
	type Dispatch,
	type SetStateAction,
	type MouseEvent,
	useEffect,
	useCallback,
	useMemo,
} from "react";
import { getCurrentDayEnum } from "@/lib/schedule-utils";
import {
	Day,
	LessonWeek,
	type ScheduleMode,
	type TimeSubMode,
	type FilterOptions,
} from "@/types/schedule";
import { useForm, useStore } from "@tanstack/react-form";
import { Combobox } from "@/components/ui/combobox";
import { UTCDate } from "@date-fns/utc";

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
	onClearResource?: (key: "classId" | "teacherId" | "roomId") => void;
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
	onClearResource,
}: ScheduleFiltersProps) {
	const [isOpen, setIsOpen] = useState(false);

	const form = useForm({
		defaultValues: {
			timeSubMode: "full-day" as TimeSubMode,
			atTime: "08:00",
			rangeStart: "08:00",
			rangeEnd: "17:00",
			genericWeek: LessonWeek.every as LessonWeek,
		},
	});

	const timeSubMode = useStore(form.store, state => state.values.timeSubMode);
	const genericWeek = useStore(form.store, state => state.values.genericWeek);

	const computeParams = useCallback(
		(
			targetMode: ScheduleMode,
			targetTimeSubMode: TimeSubMode,
			targetAtTime: string,
			targetRangeStart: string,
			targetRangeEnd: string,
			targetGenericDay: Day,
			targetGenericWeek: LessonWeek,
			targetDate: Date
		): Partial<LessonsControllerFindFilteredParams> => {
			const nextParams: Partial<LessonsControllerFindFilteredParams> = {};

			if (targetMode === "date") {
				if (targetTimeSubMode === "full-day") {
					nextParams.timestamp = undefined;
					nextParams.from = undefined;
					nextParams.to = undefined;
				} else if (targetTimeSubMode === "timestamp" && targetAtTime) {
					const [hours, minutes] = targetAtTime
						.split(":")
						.map(Number);

					const utcTargetDate = new UTCDate(targetDate);

					const dateWithTime = set(utcTargetDate, {
						hours,
						minutes,
						seconds: 0,
						milliseconds: 0,
					});

					nextParams.timestamp = dateWithTime.toISOString();

					nextParams.from = undefined;
					nextParams.to = undefined;
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

					const utcTargetDate = new UTCDate(targetDate);

					const fromDate = set(utcTargetDate, {
						hours: startHour,
						minutes: startMinute,
						seconds: 0,
						milliseconds: 0,
					});
					const toDate = set(utcTargetDate, {
						hours: endHour,
						minutes: endMinute,
						seconds: 0,
						milliseconds: 0,
					});

					nextParams.from = fromDate.toISOString();
					nextParams.to = toDate.toISOString();

					nextParams.timestamp = undefined;
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
		},
		[]
	);

	const handleFilterUpdate = useCallback(
		(values: typeof form.state.values) => {
			const newParameters = computeParams(
				mode,
				values.timeSubMode,
				values.atTime,
				values.rangeStart,
				values.rangeEnd,
				genericDay,
				values.genericWeek,
				date
			);

			setFilters(previousFilters => ({
				...previousFilters,
				...newParameters,
			}));
		},
		[form, computeParams, mode, genericDay, date, setFilters]
	);

	// Update filters when external props (mode, date, or genericDay) change
	useEffect(() => {
		handleFilterUpdate(form.state.values);
	}, [mode, date, genericDay, form, handleFilterUpdate]);

	const handleGenericDayChange = (value: string) => {
		setGenericDay(value as Day);
	};

	const handleModeChange = (value: string) => {
		const newMode = value as ScheduleMode;

		setMode(newMode);

		if (newMode === "weekly") {
			const derivedDay = getCurrentDayEnum(date);
			setGenericDay(derivedDay);
		}
	};

	const handleEntityChange = (
		key: keyof LessonsControllerFindFilteredParams,
		value: string
	) => {
		if (value === "all" || value === "") {
			// If the filter is a primary resource, use the clear handler
			if (
				(key === "classId" ||
					key === "teacherId" ||
					key === "roomId") &&
				onClearResource
			) {
				onClearResource(key);
			} else {
				setFilters(previous => {
					const next = { ...previous, [key]: undefined };
					return next;
				});
			}
		} else {
			setFilters(previous => {
				const next = { ...previous, [key]: value };
				return next;
			});
		}
	};

	const toggleIgnoreWeek = (checked: boolean) => {
		setFilters(previousFilters => ({
			...previousFilters,
			ignoreWeek: checked,
		}));
	};

	const clearFilters = (e: MouseEvent<HTMLButtonElement>) => {
		e.stopPropagation();

		form.reset();

		if (onReset) {
			onReset();
		}
	};

	const activeCount = Object.entries(filters).filter(
		([key, value]) =>
			key !== "ignoreWeek" && value !== undefined && value !== null
	).length;

	const classItems = useMemo(
		() =>
			options.classes?.map(currentClass => ({
				value: currentClass.id,
				label: currentClass.name,
			})) ?? [],
		[options.classes]
	);

	const subjectItems = useMemo(
		() =>
			options.subjects?.map(subject => ({
				value: subject.id,
				label: subject.name,
			})) ?? [],
		[options.subjects]
	);

	const teacherItems = useMemo(
		() =>
			options.teachers?.map(teacher => ({
				value: teacher.id,
				label: `${teacher.user?.firstName} ${teacher.user?.lastName}`,
				secondaryLabel: teacher.subjects
					?.map(subject => subject.name)
					.join(", "),
			})) ?? [],
		[options.teachers]
	);

	const roomItems = useMemo(
		() =>
			options.buildings?.flatMap(
				building =>
					building.floors?.flatMap(
						floor =>
							floor.rooms?.map(room => ({
								value: room.id,
								label: room.name,
								secondaryLabel: `${building.name}, Floor ${floor.number}`,
							})) ?? []
					) ?? []
			) ?? [],
		[options.buildings]
	);

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
							className="p-0 hover:bg-transparent h-auto font-semibold cursor-pointer">
							<span className="flex items-center gap-2">
								<Filter className="h-4 w-4 text-muted-foreground" />
								<span>Filters</span>

								{activeCount > 0 && (
									<Badge
										variant="secondary"
										className="ml-1 h-5 w-5 p-0 flex items-center justify-center text-[10px]">
										{activeCount}
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
									{format(date, "PPP")}
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
									<CalendarRange className="h-4 w-4" />
									Weekly Schedule
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

					{mode === "date" ? (
						<div className="grid gap-6 sm:grid-cols-1 lg:grid-cols-2">
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
										<form.Field
											name="timeSubMode"
											validators={{
												onChangeAsync: async ({
													fieldApi,
												}) => {
													handleFilterUpdate(
														fieldApi.form.state
															.values
													);
												},
											}}
											children={field => (
												<Select
													value={field.state.value}
													onValueChange={value =>
														field.handleChange(
															value as TimeSubMode
														)
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
											)}
										/>
									</div>
									{timeSubMode === "timestamp" && (
										<div className="space-y-1">
											<Label className="text-xs text-muted-foreground">
												At Time
											</Label>
											<form.Field
												name="atTime"
												validators={{
													onChangeAsyncDebounceMs: 500,
													onChangeAsync: async ({
														fieldApi,
													}) => {
														handleFilterUpdate(
															fieldApi.form.state
																.values
														);
													},
												}}
												children={field => (
													<div className="relative">
														<Clock className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
														<Input
															type="time"
															value={
																field.state
																	.value
															}
															onChange={e =>
																field.handleChange(
																	e.target
																		.value
																)
															}
															className="h-9 pl-7"
														/>
													</div>
												)}
											/>
										</div>
									)}
									{timeSubMode === "range" && (
										<>
											<div className="space-y-1">
												<Label className="text-xs text-muted-foreground">
													From
												</Label>
												<form.Field
													name="rangeStart"
													validators={{
														onChangeAsyncDebounceMs: 500,
														onChangeAsync: async ({
															fieldApi,
														}) => {
															handleFilterUpdate(
																fieldApi.form
																	.state
																	.values
															);
														},
													}}
													children={field => (
														<div className="relative">
															<Clock className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
															<Input
																type="time"
																value={
																	field.state
																		.value
																}
																onChange={e =>
																	field.handleChange(
																		e.target
																			.value
																	)
																}
																className="h-9 pl-7"
															/>
														</div>
													)}
												/>
											</div>
											<div className="space-y-1">
												<Label className="text-xs text-muted-foreground">
													To
												</Label>
												<form.Field
													name="rangeEnd"
													validators={{
														onChangeAsyncDebounceMs: 500,
														onChangeAsync: async ({
															fieldApi,
														}) => {
															handleFilterUpdate(
																fieldApi.form
																	.state
																	.values
															);
														},
													}}
													children={field => (
														<div className="relative">
															<Clock className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
															<Input
																type="time"
																value={
																	field.state
																		.value
																}
																onChange={e =>
																	field.handleChange(
																		e.target
																			.value
																	)
																}
																className="h-9 pl-7"
															/>
														</div>
													)}
												/>
											</div>
										</>
									)}
								</div>
							</div>
							<div className="flex items-center justify-start sm:justify-end pt-8">
								<div className="flex items-center space-x-2 bg-muted/30 p-2 rounded-md border border-dashed">
									<Switch
										id="ignore-week"
										checked={filters.ignoreWeek ?? false}
										onCheckedChange={toggleIgnoreWeek}
									/>
									<Label
										htmlFor="ignore-week"
										className="text-xs cursor-pointer">
										Ignore Week Parity
									</Label>
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
										onValueChange={handleGenericDayChange}>
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
									<form.Field
										name="genericWeek"
										validators={{
											onChangeAsync: async ({
												fieldApi,
											}) => {
												handleFilterUpdate(
													fieldApi.form.state.values
												);
											},
										}}
										children={field => (
											<Select
												value={field.state.value}
												onValueChange={value =>
													field.handleChange(
														value as LessonWeek
													)
												}>
												<SelectTrigger className="h-9 capitalize">
													<SelectValue />
												</SelectTrigger>
												<SelectContent>
													<SelectItem
														value={
															LessonWeek.every
														}>
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
										)}
									/>
								</div>
							</div>
						</div>
					)}

					<Separator />

					<div className="space-y-3">
						<Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
							Refine Results
						</Label>

						<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
							<Combobox
								label="Class"
								items={classItems}
								value={filters.classId}
								onChange={value =>
									handleEntityChange("classId", value)
								}
								placeholder="All Classes"
								searchPlaceholder="Search classes..."
								emptyMessage="No class found."
							/>
							<Combobox
								label="Subject"
								items={subjectItems}
								value={filters.subjectId}
								onChange={value =>
									handleEntityChange("subjectId", value)
								}
								placeholder="All Subjects"
								searchPlaceholder="Search subjects..."
								emptyMessage="No subject found."
							/>
							<Combobox
								label="Teacher"
								items={teacherItems}
								value={filters.teacherId}
								onChange={value =>
									handleEntityChange("teacherId", value)
								}
								placeholder="All Teachers"
								searchPlaceholder="Search teachers..."
								emptyMessage="No teacher found."
							/>
							<Combobox
								label="Room"
								items={roomItems}
								value={filters.roomId}
								onChange={value =>
									handleEntityChange("roomId", value)
								}
								placeholder="All Rooms"
								searchPlaceholder="Search rooms..."
								emptyMessage="No room found."
							/>
						</div>
					</div>
				</div>
			</CollapsibleContent>
		</Collapsible>
	);
}
