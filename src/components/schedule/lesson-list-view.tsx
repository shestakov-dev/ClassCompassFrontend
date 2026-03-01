import { useMemo } from "react";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
	Clock,
	MapPin,
	User,
	BookOpen,
	ChevronDown,
	MoreVertical,
	Info,
	Edit,
	Trash2,
} from "lucide-react";
import type { LessonEntity } from "@/api/generated/models";
import { cn } from "@/lib/utils";
import { LessonWeek } from "@/types/schedule";
import { formatFlatTime, getWeekParity } from "@/lib/schedule-utils";
import { Button } from "@/components/ui/button";
import { WeekBadge } from "@/components/schedule/week-badge";

interface LessonListViewProps {
	lessons: LessonEntity[];
	currentDate: Date;
	onLessonClick?: (lesson: LessonEntity) => void;
	onEdit?: (lesson: LessonEntity) => void;
	onDelete?: (lesson: LessonEntity) => void;
}

export function LessonListView({
	lessons,
	currentDate,
	onLessonClick,
	onEdit,
	onDelete,
}: LessonListViewProps) {
	const currentWeekParity = getWeekParity(currentDate);

	// Group by time and then class id
	const groupedLessons = useMemo(() => {
		const timeGroups: Record<string, Record<string, LessonEntity[]>> = {};

		// Sort lessons by start time, class name, and week (odd before even)
		const sorted = [...lessons].sort(
			(a, b) =>
				a.startTime.localeCompare(b.startTime) ||
				(a.dailySchedule?.class?.name ?? "").localeCompare(
					b.dailySchedule?.class?.name ?? ""
				) ||
				(a.lessonWeek === "odd" ? -1 : 1)
		);

		sorted.forEach(lesson => {
			// Group by strict time slot
			const timeKey = `${lesson.startTime}|${lesson.endTime}`;
			const classKey = lesson.dailySchedule?.classId ?? "unknown";

			if (!timeGroups[timeKey]) {
				timeGroups[timeKey] = {};
			}

			if (!timeGroups[timeKey][classKey]) {
				timeGroups[timeKey][classKey] = [];
			}

			timeGroups[timeKey][classKey].push(lesson);
		});

		return timeGroups;
	}, [lessons]);

	if (!lessons.length) return null;

	return (
		<div className="space-y-4 pb-10">
			{Object.entries(groupedLessons).map(([timeKey, classGroups]) => {
				const [startIso, endIso] = timeKey.split("|");
				const timeRange = `${formatFlatTime(startIso)} - ${formatFlatTime(endIso)}`;
				const lessonCount = Object.keys(classGroups).length;

				return (
					<Collapsible
						key={timeKey}
						defaultOpen
						className="border-l-primary">
						<CollapsibleTrigger asChild>
							<div className="flex items-center justify-between p-3 px-4 bg-muted/40 hover:bg-muted/60 transition-colors cursor-pointer group">
								<div className="flex items-center gap-3">
									<div className="flex items-center gap-2 text-sm font-bold text-foreground">
										<Clock className="h-4 w-4 text-muted-foreground" />
										<span>{timeRange}</span>
									</div>
									<Badge
										variant="secondary"
										className="font-normal text-[10px] h-5 px-2">
										{lessonCount} Lesson
										{lessonCount > 1 && "s"}
									</Badge>
								</div>

								<Button
									variant="ghost"
									size="sm"
									className="h-8 w-8 p-0">
									<ChevronDown className="h-4 w-4 text-muted-foreground transition-transform duration-200 group-data-[state=open]:rotate-180" />
									<span className="sr-only">Toggle</span>
								</Button>
							</div>
						</CollapsibleTrigger>

						<CollapsibleContent>
							<Table>
								<TableHeader>
									<TableRow className="hover:bg-transparent border-b-border/50 bg-muted/5">
										<TableHead className="w-[15%] pl-4 h-9 text-xs font-semibold">
											Class
										</TableHead>
										<TableHead className="w-[25%] h-9 text-xs font-semibold">
											Subject
										</TableHead>
										<TableHead className="w-[20%] h-9 text-xs font-semibold">
											Teacher
										</TableHead>
										<TableHead className="w-[15%] h-9 text-xs font-semibold">
											Room
										</TableHead>
										<TableHead className="w-[10%] h-9 text-xs font-semibold text-right">
											Week
										</TableHead>
										<TableHead className="w-[15%] pr-4 h-9 text-xs font-semibold text-right">
											Actions
										</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{Object.values(classGroups).flatMap(
										groupLessons =>
											groupLessons.map(lesson => (
												<TableRow
													key={lesson.id}
													onClick={() =>
														onLessonClick?.(lesson)
													}
													className={cn(
														"cursor-pointer hover:bg-muted/30 border-b-border/40 last:border-0 transition-colors",
														!isLessonActive(
															lesson,
															currentWeekParity
														) && "opacity-40"
													)}>
													<TableCell className="font-medium py-2 pl-4">
														<Badge
															variant="outline"
															className="font-bold text-xs whitespace-nowrap">
															{
																lesson
																	.dailySchedule
																	?.class
																	?.name
															}
														</Badge>
													</TableCell>

													<TableCell className="py-2">
														<div className="flex items-center gap-2">
															<BookOpen className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
															<span className="text-sm truncate font-medium">
																{
																	lesson
																		.subject
																		?.name
																}
															</span>
														</div>
													</TableCell>

													<TableCell className="py-2">
														<div className="flex items-center gap-2">
															<User className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
															<span className="text-sm truncate">
																{
																	lesson
																		.teacher
																		?.user
																		?.firstName
																}{" "}
																{
																	lesson
																		.teacher
																		?.user
																		?.lastName
																}
															</span>
														</div>
													</TableCell>

													<TableCell className="py-2">
														<div className="flex items-center gap-2">
															<MapPin className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
															<span className="text-sm truncate">
																{
																	lesson.room
																		?.name
																}
															</span>
														</div>
													</TableCell>

													<TableCell className="py-2 text-right">
														<WeekBadge
															lessonWeek={
																lesson.lessonWeek
															}
															format="short"
															solid
															className="text-[10px] px-1.5 h-5"
														/>
													</TableCell>

													<TableCell className="py-2 pr-4 text-right">
														<DropdownMenu>
															<DropdownMenuTrigger
																asChild>
																<Button
																	variant="ghost"
																	size="icon"
																	className="h-7 w-7"
																	onClick={e =>
																		e.stopPropagation()
																	}>
																	<MoreVertical className="h-3.5 w-3.5" />
																</Button>
															</DropdownMenuTrigger>
															<DropdownMenuContent align="end">
																<DropdownMenuItem
																	onClick={e => {
																		e.stopPropagation();
																		onLessonClick?.(
																			lesson
																		);
																	}}>
																	<Info className="h-4 w-4 mr-2" />
																	Info
																</DropdownMenuItem>
																<DropdownMenuItem
																	onClick={e => {
																		e.stopPropagation();
																		onEdit?.(
																			lesson
																		);
																	}}>
																	<Edit className="h-4 w-4 mr-2" />
																	Edit
																</DropdownMenuItem>
																<DropdownMenuItem
																	onClick={e => {
																		e.stopPropagation();
																		onDelete?.(
																			lesson
																		);
																	}}
																	className="text-destructive focus:text-destructive">
																	<Trash2 className="h-4 w-4 mr-2 text-destructive focus:text-destructive" />
																	Delete
																</DropdownMenuItem>
															</DropdownMenuContent>
														</DropdownMenu>
													</TableCell>
												</TableRow>
											))
									)}
								</TableBody>
							</Table>
						</CollapsibleContent>
					</Collapsible>
				);
			})}
		</div>
	);
}

function isLessonActive(lesson: LessonEntity, currentParity: string) {
	if (lesson.lessonWeek === LessonWeek.every) {
		return true;
	}

	return lesson.lessonWeek === currentParity;
}
