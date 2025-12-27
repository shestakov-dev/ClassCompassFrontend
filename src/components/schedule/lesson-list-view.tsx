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
import { Clock, MapPin, User, BookOpen, ChevronDown } from "lucide-react";
import type { LessonEntity } from "@/api/generated/models";
import { cn } from "@/lib/utils";
import { LessonWeek } from "@/types/schedule";
import { getWeekParity } from "@/lib/schedule-utils";
import { format, parseISO } from "date-fns";
import { Button } from "@/components/ui/button";

interface LessonListViewProps {
	lessons: LessonEntity[];
	currentDate: Date;
}

const WEEK_BADGE_STYLES = {
	[LessonWeek.odd]: "bg-chart-3 text-chart-3-foreground",
	[LessonWeek.even]: "bg-chart-4 text-chart-4-foreground",
	[LessonWeek.every]: "bg-primary text-primary-foreground",
};

export function LessonListView({ lessons, currentDate }: LessonListViewProps) {
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
			const classKey = lesson.dailySchedule?.class?.id ?? "unknown";

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
				const startDate = parseISO(startIso);
				const endDate = parseISO(endIso);
				const timeRange = `${format(startDate, "HH:mm")} - ${format(endDate, "HH:mm")}`;
				const classCount = Object.keys(classGroups).length;

				return (
					<Collapsible
						key={timeKey}
						defaultOpen
						className="border-l-primary">
						{/* Header / Trigger Area */}
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
										{classCount}{" "}
										{classCount === 1 ? "Class" : "Classes"}
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

						{/* Content Table */}
						<CollapsibleContent>
							<Table>
								<TableHeader>
									<TableRow className="hover:bg-transparent border-b-border/50 bg-muted/5">
										<TableHead className="w-[15%] pl-4 h-9 text-xs font-semibold">
											Class
										</TableHead>
										<TableHead className="w-[30%] h-9 text-xs font-semibold">
											Subject
										</TableHead>
										<TableHead className="w-[25%] h-9 text-xs font-semibold">
											Teacher
										</TableHead>
										<TableHead className="w-[20%] h-9 text-xs font-semibold">
											Room
										</TableHead>
										<TableHead className="w-[10%] pr-4 h-9 text-xs font-semibold text-right">
											Week
										</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{Object.values(classGroups).map(
										groupLessons => {
											const first = groupLessons[0];

											return (
												<TableRow
													key={first.id}
													className="hover:bg-muted/30 border-b-border/40 last:border-0">
													{/* Class Name (Merged Cell) */}
													<TableCell className="font-medium align-top py-2 pl-4">
														<Badge
															variant="outline"
															className="font-bold text-xs whitespace-nowrap">
															{
																first
																	.dailySchedule
																	?.class
																	?.name
															}
														</Badge>
													</TableCell>

													<TableCell className="align-top p-0">
														<div className="flex flex-col">
															{groupLessons.map(
																lesson => (
																	<div
																		key={
																			lesson.id
																		}
																		className={cn(
																			"px-4 py-2 flex items-center gap-2 min-h-10",
																			!isLessonActive(
																				lesson,
																				currentWeekParity
																			) &&
																				"opacity-40"
																		)}>
																		<BookOpen className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
																		<span className="text-sm truncate font-medium">
																			{
																				lesson
																					.subject
																					?.name
																			}
																		</span>
																	</div>
																)
															)}
														</div>
													</TableCell>

													<TableCell className="align-top p-0">
														<div className="flex flex-col">
															{groupLessons.map(
																lesson => (
																	<div
																		key={
																			lesson.id
																		}
																		className={cn(
																			"px-4 py-2 flex items-center gap-2 min-h-10",
																			!isLessonActive(
																				lesson,
																				currentWeekParity
																			) &&
																				"opacity-40"
																		)}>
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
																)
															)}
														</div>
													</TableCell>

													<TableCell className="align-top p-0">
														<div className="flex flex-col">
															{groupLessons.map(
																lesson => (
																	<div
																		key={
																			lesson.id
																		}
																		className={cn(
																			"px-4 py-2 flex items-center gap-2 min-h-10",
																			!isLessonActive(
																				lesson,
																				currentWeekParity
																			) &&
																				"opacity-40"
																		)}>
																		<MapPin className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
																		<span className="text-sm truncate">
																			{
																				lesson
																					.room
																					?.name
																			}
																		</span>
																	</div>
																)
															)}
														</div>
													</TableCell>

													<TableCell className="align-top p-0 pr-4">
														<div className="flex flex-col">
															{groupLessons.map(
																lesson => (
																	<div
																		key={
																			lesson.id
																		}
																		className={cn(
																			"pl-4 py-2 flex items-center justify-end min-h-10",
																			!isLessonActive(
																				lesson,
																				currentWeekParity
																			) &&
																				"opacity-40"
																		)}>
																		<Badge
																			className={cn(
																				"text-[10px] uppercase font-bold border-none px-1.5 h-5 shadow-none",
																				WEEK_BADGE_STYLES[
																					lesson
																						.lessonWeek
																				]
																			)}>
																			{lesson.lessonWeek ===
																			LessonWeek.every
																				? "All"
																				: lesson.lessonWeek}
																		</Badge>
																	</div>
																)
															)}
														</div>
													</TableCell>
												</TableRow>
											);
										}
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
