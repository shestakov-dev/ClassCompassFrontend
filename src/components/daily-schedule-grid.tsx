"use client";

import { differenceInMinutes, format, startOfDay } from "date-fns";
import { enUS } from "date-fns/locale/en-US";
import {
	type ReactNode,
	createContext,
	useCallback,
	useContext,
	useMemo,
	useState,
} from "react";
import type { Locale } from "date-fns";
import { LessonEntityLessonWeek as LessonWeek } from "@/api/generated/models";

// --- CONFIGURATION ---
const SLOT_HEIGHT_PX = 80;
const COLUMN_GAP_PX = 8; // Horizontal space between overlapping columns
const ROW_GAP_PX = 4; // Vertical space between consecutive lessons

// --- TYPES ---
export type ScheduleEvent = {
	id: string;
	start: Date;
	end: Date;
	subject: string;
	room: string;
	teacher: string;
	type: LessonWeek;
};

// Internal type for rendering
type LayoutEvent = ScheduleEvent & {
	style: {
		top: string;
		height: string;
		left: string;
		width: string;
	};
};

// --- CONTEXT ---
type ScheduleContextType = {
	date: Date;
	setDate: (date: Date) => void;
	events: ScheduleEvent[];
	locale: Locale;
	onEventClick?: (event: ScheduleEvent) => void;
};

const ScheduleContext = createContext<ScheduleContextType>(
	{} as ScheduleContextType
);

type DailyScheduleProps = {
	children: ReactNode;
	defaultDate?: Date;
	events?: ScheduleEvent[];
	locale?: Locale;
	onEventClick?: (event: ScheduleEvent) => void;
	date?: Date;
	onDateChange?: (date: Date) => void;
};

const DailySchedule = ({
	children,
	defaultDate = new Date(),
	locale = enUS,
	onEventClick,
	events = [],
	date: controlledDate,
	onDateChange,
}: DailyScheduleProps) => {
	const [internalDate, setInternalDate] = useState(defaultDate);

	const date = controlledDate ?? internalDate;

	const setDate = useCallback(
		(newDate: Date) => {
			if (onDateChange) onDateChange(newDate);
			setInternalDate(newDate);
		},
		[onDateChange]
	);

	return (
		<ScheduleContext.Provider
			value={{
				date,
				setDate,
				events,
				locale,
				onEventClick,
			}}>
			{children}
		</ScheduleContext.Provider>
	);
};

export const useScheduleContext = () => useContext(ScheduleContext);

// --- COMPONENT: EVENT CARD ---
const EventCard = ({ event }: { event: LayoutEvent }) => {
	const { onEventClick } = useScheduleContext();

	const heightPx = parseFloat(event.style.height);

	return (
		<div
			onClick={e => {
				e.stopPropagation();
				onEventClick?.(event);
			}}
			className="absolute z-10 flex flex-col gap-0.5 border-l-4 rounded-md px-2 py-1 text-xs text-foreground transition-all hover:brightness-95 hover:shadow-md cursor-pointer overflow-hidden bg-primary/10 border-primary border-l-primary"
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

// --- COMPONENT: TIME GRID ---
const TimeGrid = () => {
	const { events, date } = useScheduleContext();

	// 1. Calculate Grid Range (Min/Max Hours)
	const { minHour, totalHours, ticks } = useMemo(() => {
		if (events.length === 0)
			return {
				minHour: 6,
				totalHours: 14,
				ticks: Array.from({ length: 15 }, (_, i) => 6 + i),
			};

		const starts = events.map(e => e.start.getHours());
		const ends = events.map(
			e => e.end.getHours() + (e.end.getMinutes() > 0 ? 1 : 0)
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

	// 2. Calculate Layout (Clusters for Overlaps)
	const layoutEvents = useMemo(() => {
		if (!events.length) return [];

		// Sort events by start time, then duration (longest first)
		const sorted = [...events].sort((a, b) => {
			if (a.start.getTime() !== b.start.getTime())
				return a.start.getTime() - b.start.getTime();
			return b.end.getTime() - a.end.getTime();
		});

		const result: LayoutEvent[] = [];
		let cluster: ScheduleEvent[] = [];
		let clusterEnd = 0;

		const processCluster = (group: ScheduleEvent[]) => {
			if (group.length === 0) return;

			// Pack events into columns
			const columns: ScheduleEvent[][] = [];
			for (const ev of group) {
				let placed = false;
				for (let i = 0; i < columns.length; i++) {
					const lastInCol = columns[i][columns[i].length - 1];
					// If event starts after the last one ends, it fits in this column
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

			// Calculate style for each event in the cluster
			const widthPercent = 100 / columns.length;
			columns.forEach((col, colIndex) => {
				col.forEach(ev => {
					const startMinutes =
						(ev.start.getHours() - minHour) * 60 + ev.start.getMinutes();
					const durationMinutes = differenceInMinutes(ev.end, ev.start);

					result.push({
						...ev,
						style: {
							top: `${(startMinutes / 60) * SLOT_HEIGHT_PX}px`,
							// Add vertical gap between stacked lessons
							height: `${Math.max(
								(durationMinutes / 60) * SLOT_HEIGHT_PX - ROW_GAP_PX,
								24
							)}px`,
							left: `${colIndex * widthPercent}%`,
							// Add horizontal gap between columns
							width: `calc(${widthPercent}% - ${COLUMN_GAP_PX}px)`,
						},
					});
				});
			});
		};

		for (const ev of sorted) {
			// Check for overlap with the current cluster
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
				{/* Y-Axis: Time Labels */}
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

				{/* Main Grid Area */}
				<div className="flex-1 relative">
					{/* Horizontal Guidelines */}
					{ticks.map((hour, index) => (
						<div
							key={hour}
							className="absolute w-full border-b border-dashed border-border/40"
							style={{ top: `${index * SLOT_HEIGHT_PX}px` }}
						/>
					))}

					{/* Events */}
					{layoutEvents.map(event => (
						<EventCard
							key={event.id}
							event={event}
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
	if (startOfDay(now).getTime() !== startOfDay(date).getTime()) return null;

	const currentHour = now.getHours();
	if (currentHour < minHour || currentHour >= maxHour) return null;

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

export { DailySchedule, TimeGrid };
