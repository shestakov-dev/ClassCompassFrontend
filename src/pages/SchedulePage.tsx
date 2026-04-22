import { useCallback, useMemo, useState } from "react";
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
	Plus,
} from "lucide-react";
import { addDays, subDays, setDay, parseISO } from "date-fns";
import { useSession } from "@/context/session-context";
import { useSchool } from "@/context/school-context";
import { SchoolRequired } from "@/components/common/school-required";
import {
	useLessonsControllerFindFiltered,
	useLessonsControllerCreate,
	useLessonsControllerUpdate,
	useLessonsControllerRemove,
	getLessonsControllerFindFilteredQueryKey,
} from "@/api/generated/endpoints/lessons/lessons";
import { useClassesControllerFindAllBySchool } from "@/api/generated/endpoints/classes/classes";
import { useBuildingsControllerFindAllBySchool } from "@/api/generated/endpoints/buildings/buildings";
import { useSubjectsControllerFindAllBySchool } from "@/api/generated/endpoints/subjects/subjects";
import { useTeachersControllerFindAllBySchool } from "@/api/generated/endpoints/teachers/teachers";
import {
	Day,
	ALL_DAYS,
	DAY_TO_DAY_INDEX,
	type CreateLessonFormData,
} from "@/types/schedule";
import {
	buildScheduleFilters,
	getCurrentDayEnum,
	isScheduleDefaultFilter,
} from "@/lib/schedule-utils";
import { toast } from "sonner";
import type { LessonsControllerFindFilteredParams } from "@/api/generated/models/lessonsControllerFindFilteredParams";
import type { UpdateLessonDto } from "@/api/generated/models/updateLessonDto";
import type { LessonEntity } from "@/api/generated/models";
import { keepPreviousData, useQueryClient } from "@tanstack/react-query";
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
import {
	CreateLessonDialog,
	EditLessonDialog,
	DeleteLessonDialog,
	LessonDetailsDialog,
} from "@/components/schedule/lesson-dialogs";
import { UTCDate } from "@date-fns/utc";

export default function SchedulePage() {
	const { user, isAdmin } = useSession();
	const queryClient = useQueryClient();
	const [selectedLesson, setSelectedLesson] = useState<LessonEntity | null>(
		null
	);
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [createDialogOpen, setCreateDialogOpen] = useState(false);
	const [editDialogOpen, setEditDialogOpen] = useState(false);
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
	const navigate = Route.useNavigate();
	const search = Route.useSearch();

	const mode = search.mode ?? "weekly";
	const currentDate = useMemo(
		() => (search.date ? parseISO(search.date) : new Date()),
		[search.date]
	);
	const genericDay = search.day ?? getCurrentDayEnum();
	const filters = useMemo(
		() => buildScheduleFilters(user, search),
		[search, user]
	);
	const isDefaultFilters = useMemo(
		() => isScheduleDefaultFilter(user, filters, search),
		[user, filters, search]
	);

	const { schoolId } = useSchool();

	const {
		data: lessons,
		isLoading,
		isFetching,
	} = useLessonsControllerFindFiltered(schoolId!, filters, {
		query: {
			enabled: !!schoolId,
			staleTime: 1000 * 60 * 1,
			placeholderData: keepPreviousData,
			meta: { operationContext: "get lessons" },
		},
	});

	const { data: classes } = useClassesControllerFindAllBySchool(schoolId!, {
		query: {
			enabled: !!schoolId,
			staleTime: 1000 * 60 * 1,
			meta: { operationContext: "get all classes" },
		},
	});

	const { data: subjects } = useSubjectsControllerFindAllBySchool(schoolId!, {
		query: {
			enabled: !!schoolId,
			staleTime: 1000 * 60 * 1,
			meta: { operationContext: "get all subjects" },
		},
	});

	const { data: teachers } = useTeachersControllerFindAllBySchool(schoolId!, {
		query: {
			enabled: !!schoolId,
			staleTime: 1000 * 60 * 1,
			meta: { operationContext: "get all teachers" },
		},
	});

	const { data: buildings } = useBuildingsControllerFindAllBySchool(
		schoolId!,
		{
			query: {
				enabled: !!schoolId,
				staleTime: 1000 * 60 * 1,
				meta: { operationContext: "get all buildings" },
			},
		}
	);

	const hasLessons = lessons && lessons.length > 0;
	const showSkeleton = isLoading || (isFetching && !lessons);

	const updateSearch = useCallback(
		(newParams: Partial<typeof search>) => {
			navigate({
				search: previousSearch => ({ ...previousSearch, ...newParams }),
				replace: true,
			});
		},
		[navigate]
	);

	const handleDateChange = useCallback(
		(newDate: Date) => {
			const dayEnum = getCurrentDayEnum(newDate);

			// Preserve the local date without timezone conversion
			const utcDate = new UTCDate(
				newDate.getFullYear(),
				newDate.getMonth(),
				newDate.getDate(),
				0,
				0,
				0,
				0
			);

			const updates: Partial<typeof search> = {
				date: utcDate.toISOString(),
				day: dayEnum,
			};

			if (search.timestamp) {
				const oldTimestamp = new UTCDate(search.timestamp);

				const safeTargetDate = new UTCDate(
					newDate.getFullYear(),
					newDate.getMonth(),
					newDate.getDate(),
					oldTimestamp.getHours(),
					oldTimestamp.getMinutes()
				);
				updates.timestamp = safeTargetDate.toISOString();
			}

			if (search.from && search.to) {
				const oldFrom = new UTCDate(search.from);
				const oldTo = new UTCDate(search.to);

				updates.from = new UTCDate(
					newDate.getFullYear(),
					newDate.getMonth(),
					newDate.getDate(),
					oldFrom.getHours(),
					oldFrom.getMinutes()
				).toISOString();

				updates.to = new UTCDate(
					newDate.getFullYear(),
					newDate.getMonth(),
					newDate.getDate(),
					oldTo.getHours(),
					oldTo.getMinutes()
				).toISOString();
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
						previousFilters: LessonsControllerFindFilteredParams
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

	const handleLessonClick = useCallback((lesson: LessonEntity) => {
		setSelectedLesson(lesson);
		setIsModalOpen(true);
	}, []);

	const createLessonMutation = useLessonsControllerCreate({
		mutation: {
			meta: {
				operationContext: "create lesson",
			},
			onSuccess: () => {
				toast.success("Lesson created successfully");

				queryClient.invalidateQueries({
					queryKey: getLessonsControllerFindFilteredQueryKey(
						schoolId!,
						filters
					),
				});

				setCreateDialogOpen(false);
			},
		},
	});
	const updateLessonMutation = useLessonsControllerUpdate({
		mutation: {
			meta: {
				operationContext: "update lesson",
			},
			onSuccess: () => {
				toast.success("Lesson updated successfully");

				queryClient.invalidateQueries({
					queryKey: getLessonsControllerFindFilteredQueryKey(
						schoolId!,
						filters
					),
				});

				setEditDialogOpen(false);
				setSelectedLesson(null);
			},
		},
	});
	const deleteLessonMutation = useLessonsControllerRemove({
		mutation: {
			meta: {
				operationContext: "delete lesson",
			},
			onSuccess: () => {
				toast.success("Lesson deleted successfully");

				queryClient.invalidateQueries({
					queryKey: getLessonsControllerFindFilteredQueryKey(
						schoolId!,
						filters
					),
				});

				setIsModalOpen(false);
				setSelectedLesson(null);
			},
		},
	});

	const handleCreateLesson = (data: CreateLessonFormData) => {
		const { day, classId, ...rest } = data;
		if (!day || !classId) {
			toast.error("Class and day are required");
			return;
		}
		createLessonMutation.mutate({
			data: { ...rest, classId, day },
		});
	};

	const handleDeleteLesson = () => {
		if (selectedLesson) {
			deleteLessonMutation.mutate({ id: selectedLesson.id });
		}
	};

	const handleEditLesson = (data: UpdateLessonDto) => {
		if (!selectedLesson) return;
		updateLessonMutation.mutate({ id: selectedLesson.id, data });
	};

	const handleEditClick = (lesson: LessonEntity) => {
		setSelectedLesson(lesson);
		setEditDialogOpen(true);
	};

	const handleDeleteClick = (lesson: LessonEntity) => {
		setSelectedLesson(lesson);
		setDeleteDialogOpen(true);
	};

	const createLessonDefaults = useMemo(() => {
		const isValidDay = Object.values(Day).includes(genericDay);

		return {
			day: isValidDay ? genericDay : undefined,
			classId: filters.classId,
			subjectId: filters.subjectId,
			teacherId: filters.teacherId,
			roomId: filters.roomId,
		};
	}, [filters, genericDay]);

	return (
		<SchoolRequired>
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
								View your upcoming classes
							</p>
						</div>

						<div className="flex items-center gap-2">
							{isAdmin && (
								<Button
									variant="outline"
									size="sm"
									onClick={() => {
										setCreateDialogOpen(true);
									}}
									className="gap-2">
									<Plus className="h-4 w-4" />
									New Lesson
								</Button>
							)}
						</div>
					</div>

					<div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
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
										{currentDate.toLocaleDateString(
											undefined,
											{
												weekday: "short",
												month: "short",
												day: "numeric",
											}
										)}
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

					<div className="flex items-center justify-between gap-4 shrink-0">
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
												There are no classes scheduled
												for{" "}
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
										onLessonClick={handleLessonClick}
										onEdit={handleEditClick}
										onDelete={handleDeleteClick}
									/>
								</div>
							) : (
								<div className="h-full overflow-auto pr-2 animate-in fade-in duration-500">
									<LessonListView
										lessons={lessons ?? []}
										currentDate={currentDate}
										onLessonClick={handleLessonClick}
										onEdit={handleEditClick}
										onDelete={handleDeleteClick}
									/>
								</div>
							)}
						</div>
					</div>
				</div>

				<LessonDetailsDialog
					open={isModalOpen}
					onOpenChange={setIsModalOpen}
					lesson={selectedLesson}
					onEdit={() => {
						setEditDialogOpen(true);
					}}
					onDelete={() => {
						setDeleteDialogOpen(true);
					}}
				/>

				<CreateLessonDialog
					open={createDialogOpen}
					onOpenChange={setCreateDialogOpen}
					onSubmit={handleCreateLesson}
					isLoading={createLessonMutation.isPending}
					defaultValues={createLessonDefaults}
					options={{
						classes,
						subjects,
						teachers,
						buildings,
						dailySchedules: undefined,
					}}
				/>

				<EditLessonDialog
					open={editDialogOpen}
					onOpenChange={setEditDialogOpen}
					onSubmit={handleEditLesson}
					isLoading={updateLessonMutation.isPending}
					lesson={selectedLesson}
					options={{
						classes,
						subjects,
						teachers,
						buildings,
					}}
				/>

				<DeleteLessonDialog
					open={deleteDialogOpen}
					onOpenChange={setDeleteDialogOpen}
					onConfirm={handleDeleteLesson}
					isLoading={deleteLessonMutation.isPending}
					lesson={selectedLesson}
				/>
			</div>
		</SchoolRequired>
	);
}
