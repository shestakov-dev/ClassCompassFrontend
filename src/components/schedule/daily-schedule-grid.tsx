import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import { differenceInMinutes, format, startOfDay } from "date-fns";
import { useMemo } from "react";
import { LessonEntityLessonWeek as LessonWeek } from "@/api/generated/models";

const SLOT_HEIGHT_PX = 80;
const COLUMN_GAP_PX = 8;
const ROW_GAP_PX = 4;

export type ScheduleEvent = {
	id: string;
	start: Date;
	end: Date;
	subject: string;
	room: string;
	teacher: string;
	type: LessonWeek;
};

type LayoutEvent = ScheduleEvent & {
	style: {
		top: string;
		height: string;
		left: string;
		width: string;
	};
};

const eventCardVariants = cva(
	"absolute z-10 flex flex-col gap-0.5 border-l-4 rounded-md px-2 py-1 text-xs text-foreground transition-all hover:brightness-95 hover:shadow-md cursor-pointer overflow-hidden",
	{
		variants: {
			variant: {
				default: "bg-primary/10 border-primary border-l-primary",
				odd: "bg-chart-3/15 border-chart-3",
				even: "bg-chart-4/15 border-chart-4",
			},
		},
		defaultVariants: {
			variant: "default",
		},
	}
);

interface EventCardProps {
	event: LayoutEvent;
	onClick?: (event: ScheduleEvent) => void;
}

const EventCard = ({ event, onClick }: EventCardProps) => {
	const variantMap: Record<
		string,
		VariantProps<typeof eventCardVariants>["variant"]
	> = {
		[LessonWeek.odd]: "odd",
		[LessonWeek.even]: "even",
	};

	const variant = variantMap[event.type] ?? "default";
	const heightPx = parseFloat(event.style.height);

	return (
		<div
			onClick={e => {
				e.stopPropagation();
				onClick?.(event);
			}}
			className={cn(eventCardVariants({ variant }))}
			style={event.style}>
			<div className="flex justify-between w-full font-semibold leading-none text-sm">
				<span className="truncate">{event.subject}</span>
				{heightPx > 40 && (
					<span className="text-[10px] opacity-70 whitespace-nowrap pl-1">
						{format(event.start, "HH:mm")}
					</span>
				)}
			</div>

			<div className="flex flex-col text-[11px] opacity-90 leading-tight gap-0.5 mt-1">
				<div className="flex justify-between items-center">
					<span className="truncate">{event.room}</span>
					<span className="text-[9px] opacity-60">
						{heightPx <= 40
							? `${format(event.start, "HH:mm")} - ${format(event.end, "HH:mm")}`
							: format(event.end, "HH:mm")}
					</span>
				</div>
				{heightPx > 50 && (
					<div className="truncate opacity-80">{event.teacher}</div>
				)}
			</div>

			{heightPx > 70 && (
				<div className="mt-auto self-start">
					<span className="inline-block px-1 rounded-[2px] bg-primary/20 text-[9px] font-bold uppercase tracking-wider">
						{event.type}
					</span>
				</div>
			)}
		</div>
	);
};

interface TimeGridProps {
	events: ScheduleEvent[];
	date: Date;
	minHour?: number;
	maxHour?: number;
	onEventClick?: (event: ScheduleEvent) => void;
}

export const TimeGrid = ({ events, date, onEventClick }: TimeGridProps) => {
	const { minHour, totalHours, ticks } = useMemo(() => {
		if (events.length === 0) {
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

		const starts = events.map(event => event.start.getHours());
		const ends = events.map(
			event => event.end.getHours() + (event.end.getMinutes() > 0 ? 1 : 0)
		);

		const min = Math.max(0, Math.min(...starts) - 1);
		const max = Math.min(24, Math.max(...ends) + 1);
		const total = max - min;

		return {
			minHour: min,
			totalHours: total,
			ticks: Array.from({ length: total + 1 }, (_, i) => min + i),
		};
	}, [events]);

	const layoutEvents = useMemo(() => {
		if (!events.length) {
			return [];
		}

		const sorted = [...events].sort((a, b) => {
			if (a.start.getTime() !== b.start.getTime()) {
				return a.start.getTime() - b.start.getTime();
			}

			return b.end.getTime() - a.end.getTime();
		});

		const result: LayoutEvent[] = [];
		let cluster: ScheduleEvent[] = [];
		let clusterEnd = 0;

		const processCluster = (group: ScheduleEvent[]) => {
			if (group.length === 0) {
				return;
			}

			const columns: ScheduleEvent[][] = [];
			for (const ev of group) {
				let placed = false;

				for (let i = 0; i < columns.length; i++) {
					const lastInCol = columns[i][columns[i].length - 1];
					if (lastInCol.end.getTime() <= ev.start.getTime()) {
						columns[i].push(ev);
						placed = true;
						break;
					}
				}

				if (!placed) {
					columns.push([ev]);
				}
			}

			const widthPercent = 100 / columns.length;
			columns.forEach((col, colIndex) => {
				col.forEach(ev => {
					const startMinutes =
						(ev.start.getHours() - minHour) * 60 +
						ev.start.getMinutes();
					const durationMinutes = differenceInMinutes(
						ev.end,
						ev.start
					);

					result.push({
						...ev,
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

		for (const ev of sorted) {
			if (ev.start.getTime() < clusterEnd || cluster.length === 0) {
				cluster.push(ev);
				clusterEnd = Math.max(clusterEnd, ev.end.getTime());
			} else {
				processCluster(cluster);
				cluster = [ev];
				clusterEnd = ev.end.getTime();
			}
		}
		processCluster(cluster);

		return result;
	}, [events, minHour]);

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

					{layoutEvents.map(event => (
						<EventCard
							key={event.id}
							event={event}
							onClick={onEventClick}
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
