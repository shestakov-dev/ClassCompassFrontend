import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import {
	differenceInMinutes,
	format,
	startOfDay,
	addDays,
	parseISO,
	set,
	startOfWeek,
} from "date-fns";
import { useMemo } from "react";
import {
	LessonEntityLessonWeek as LessonWeek,
	type LessonEntity,
} from "@/api/generated/models";
import { DAY_TO_DAY_INDEX, Day } from "@/types/schedule";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const SLOT_HEIGHT_PX = 100;
const COLUMN_GAP_PX = 8;
const ROW_GAP_PX = 4;

type LayoutLesson = LessonEntity & {
	computedStart: Date;
	computedEnd: Date;
	style: {
		top: string;
		height: string;
		left: string;
		width: string;
	};
};

const lessonCardVariants = cva("", {
	variants: {
		variant: {
			default: "border-l-primary",
			odd: "border-l-chart-3",
			even: "border-l-chart-4",
		},
	},
	defaultVariants: {
		variant: "default",
	},
});

const weekBadgeVariants = cva("text-[9px] font-bold uppercase tracking-wider", {
	variants: {
		variant: {
			default: "bg-primary/20 text-primary border-primary/30",
			odd: "bg-chart-3/20 text-chart-3 border-chart-3/30",
			even: "bg-chart-4/20 text-chart-4 border-chart-4/30",
		},
	},
	defaultVariants: {
		variant: "default",
	},
});

interface LessonCardProps {
	lesson: LayoutLesson;
	onClick?: (lesson: LessonEntity) => void;
}

const LessonCard = ({ lesson, onClick }: LessonCardProps) => {
	const variantMap: Record<
		string,
		VariantProps<typeof lessonCardVariants>["variant"]
	> = {
		[LessonWeek.odd]: "odd",
		[LessonWeek.even]: "even",
	};

	const variant = variantMap[lesson.lessonWeek] ?? "default";
	const heightPx = parseFloat(lesson.style.height);

	const subjectName = lesson.subject?.name ?? "Unknown Subject";
	const roomName = lesson.room?.name ?? "Unknown Room";
	const teacherName = lesson.teacher?.user
		? `${lesson.teacher.user.firstName} ${lesson.teacher.user.lastName}`
		: "Unknown Teacher";
	const className = lesson.dailySchedule?.class?.name ?? "Unknown Class";

	const startTime = parseISO(lesson.startTime);
	const endTime = parseISO(lesson.endTime);
	const timeRange = `${format(startTime, "HH:mm")} - ${format(endTime, "HH:mm")}`;

	const weekBadgeText =
		lesson.lessonWeek === LessonWeek.every
			? "Every"
			: lesson.lessonWeek === LessonWeek.odd
				? "Odd"
				: "Even";

	return (
		<Card
			onClick={clickEvent => {
				clickEvent.stopPropagation();
				onClick?.(lesson);
			}}
			className={cn(
				"absolute z-10 border-l-4 cursor-pointer transition-all hover:shadow-lg overflow-hidden",
				"p-0 gap-0 shadow-sm flex flex-col justify-center",
				lessonCardVariants({ variant })
			)}
			style={lesson.style}>
			<CardHeader className="p-2 pb-1 gap-1">
				<CardTitle className="text-base font-semibold truncate leading-tight">
					{subjectName}
				</CardTitle>
				<div className="flex items-center gap-1.5 text-xs font-medium opacity-70">
					<span>{timeRange}</span>
					<Badge
						variant="outline"
						className={cn(
							"h-4 px-1.5 text-[10px]",
							weekBadgeVariants({ variant })
						)}>
						{weekBadgeText}
					</Badge>
				</div>
			</CardHeader>

			<CardContent className="p-2 pt-0 text-xs opacity-80 space-y-0.5">
				<div className="truncate">{className}</div>
				<div className="truncate">{roomName}</div>
				{heightPx > 70 && (
					<div className="truncate opacity-90">{teacherName}</div>
				)}
			</CardContent>
		</Card>
	);
};

interface TimeGridProps {
	lessons: LessonEntity[];
	date: Date;
	minHour?: number;
	maxHour?: number;
	onLessonClick?: (lesson: LessonEntity) => void;
}

export const TimeGrid = ({ lessons, date, onLessonClick }: TimeGridProps) => {
	// Compute display dates for each lesson
	const lessonsWithDates = useMemo(() => {
		const weekStart = startOfWeek(date, { weekStartsOn: 1 });
		return lessons.map(lesson => {
			const dayName = lesson.dailySchedule?.day ?? Day.monday;
			const dayOffset = DAY_TO_DAY_INDEX[dayName];
			const daysToAdd = dayOffset === 0 ? 6 : dayOffset - 1;
			const targetDate = addDays(weekStart, daysToAdd);

			const startTime = parseISO(lesson.startTime);
			const endTime = parseISO(lesson.endTime);

			return {
				...lesson,
				computedStart: set(targetDate, {
					hours: startTime.getHours(),
					minutes: startTime.getMinutes(),
				}),
				computedEnd: set(targetDate, {
					hours: endTime.getHours(),
					minutes: endTime.getMinutes(),
				}),
			};
		});
	}, [lessons, date]);
	const { minHour, totalHours, ticks } = useMemo(() => {
		if (lessonsWithDates.length === 0) {
			const minHour = 8;
			const totalHours = 6;

			return {
				minHour,
				totalHours,
				ticks: Array.from(
					{ length: totalHours + 1 },
					(_, i) => minHour + i
				),
			};
		}

		const starts = lessonsWithDates.map(lesson =>
			lesson.computedStart.getHours()
		);
		const ends = lessonsWithDates.map(
			lesson =>
				lesson.computedEnd.getHours() +
				(lesson.computedEnd.getMinutes() > 0 ? 1 : 0)
		);

		const min = Math.max(0, Math.min(...starts) - 1);
		const max = Math.min(24, Math.max(...ends) + 1);
		const total = max - min;

		return {
			minHour: min,
			totalHours: total,
			ticks: Array.from({ length: total + 1 }, (_, i) => min + i),
		};
	}, [lessonsWithDates]);

	const layoutLessons = useMemo(() => {
		if (!lessonsWithDates.length) {
			return [];
		}

		const sorted = [...lessonsWithDates].sort((a, b) => {
			if (a.computedStart.getTime() !== b.computedStart.getTime()) {
				return a.computedStart.getTime() - b.computedStart.getTime();
			}

			return b.computedEnd.getTime() - a.computedEnd.getTime();
		});

		const result: LayoutLesson[] = [];
		let cluster: (typeof lessonsWithDates)[0][] = [];
		let clusterEnd = 0;

		const processCluster = (group: (typeof lessonsWithDates)[0][]) => {
			if (group.length === 0) {
				return;
			}

			const columns: (typeof lessonsWithDates)[0][][] = [];
			for (const lesson of group) {
				let placed = false;

				for (let i = 0; i < columns.length; i++) {
					const lastInCol = columns[i][columns[i].length - 1];
					if (
						lastInCol.computedEnd.getTime() <=
						lesson.computedStart.getTime()
					) {
						columns[i].push(lesson);
						placed = true;
						break;
					}
				}

				if (!placed) {
					columns.push([lesson]);
				}
			}

			const widthPercent = 100 / columns.length;
			columns.forEach((col, colIndex) => {
				col.forEach(lesson => {
					const startMinutes =
						(lesson.computedStart.getHours() - minHour) * 60 +
						lesson.computedStart.getMinutes();
					const durationMinutes = differenceInMinutes(
						lesson.computedEnd,
						lesson.computedStart
					);

					result.push({
						...lesson,
						style: {
							top: `${(startMinutes / 60) * SLOT_HEIGHT_PX}px`,
							height: `${Math.max(
								(durationMinutes / 60) * SLOT_HEIGHT_PX -
									ROW_GAP_PX,
								24
							)}px`,
							left: `${colIndex * widthPercent}%`,
							width: `calc(${widthPercent}% - ${COLUMN_GAP_PX}px)`,
						},
					});
				});
			});
		};

		for (const lesson of sorted) {
			if (
				lesson.computedStart.getTime() < clusterEnd ||
				cluster.length === 0
			) {
				cluster.push(lesson);
				clusterEnd = Math.max(clusterEnd, lesson.computedEnd.getTime());
			} else {
				processCluster(cluster);
				cluster = [lesson];
				clusterEnd = lesson.computedEnd.getTime();
			}
		}
		processCluster(cluster);

		return result;
	}, [lessonsWithDates, minHour]);

	return (
		<div className="flex relative h-full overflow-y-auto bg-background">
			<div
				className="flex w-full relative min-w-75 pt-6"
				style={{
					height: `${totalHours * SLOT_HEIGHT_PX}px`,
					paddingBottom: "2.5rem",
					boxSizing: "content-box",
				}}>
				<div className="w-12 shrink-0 border-r border-border/50 bg-muted/5 relative">
					{ticks.map((hour, index) => (
						<div
							key={hour}
							className="absolute w-full flex justify-end pr-2"
							style={{
								top: `${index * SLOT_HEIGHT_PX}px`,
								transform: "translateY(-50%)",
							}}>
							<span className="text-xs text-muted-foreground font-medium tabular-nums">
								{hour < 10 ? `0${hour}` : hour}:00
							</span>
						</div>
					))}
				</div>

				<div className="flex-1 relative">
					{ticks.map((_, index) => (
						<div
							key={index}
							className="absolute w-full border-b border-dashed border-border/40"
							style={{ top: `${index * SLOT_HEIGHT_PX}px` }}
						/>
					))}

					{layoutLessons.map(lesson => (
						<LessonCard
							key={lesson.id}
							lesson={lesson}
							onClick={onLessonClick}
						/>
					))}

					<CurrentTimeLine
						minHour={minHour}
						maxHour={minHour + totalHours}
						date={date}
					/>
				</div>
			</div>
		</div>
	);
};

const CurrentTimeLine = ({
	minHour,
	maxHour,
	date,
}: {
	minHour: number;
	maxHour: number;
	date: Date;
}) => {
	const now = new Date();
	if (startOfDay(now).getTime() !== startOfDay(date).getTime()) {
		return null;
	}

	const currentHour = now.getHours();
	if (currentHour < minHour || currentHour >= maxHour) {
		return null;
	}

	const minutesFromStart = (currentHour - minHour) * 60 + now.getMinutes();
	const top = (minutesFromStart / 60) * SLOT_HEIGHT_PX;

	return (
		<div
			className="absolute left-0 right-0 h-0.5 bg-red-500 z-50 pointer-events-none flex items-center"
			style={{ top: `${top}px` }}>
			<div className="w-2 h-2 rounded-full bg-red-500 -ml-1 shadow-sm" />
		</div>
	);
};
