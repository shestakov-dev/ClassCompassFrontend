import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
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

const SLOT_HEIGHT_PX = 80;

export type ScheduleEvent = {
	id: string;
	start: Date;
	end: Date;
	subject: string;
	room: string;
	teacher: string;
	type: LessonWeek;
};

const eventCardVariants = cva(
	"absolute left-1 right-1 z-10 flex flex-col gap-0.5 border-l-4 rounded-md px-2 py-1 text-xs transition-all hover:brightness-95 hover:shadow-md cursor-pointer overflow-hidden",
	{
		variants: {
			variant: {
				default: "bg-primary/10 border-primary text-primary-foreground-dark",
				odd: "bg-primary/10 border-primary text-primary-foreground-dark",
				even: "bg-primary/10 border-primary text-primary-foreground-dark",
			},
		},
		defaultVariants: {
			variant: "default",
		},
	}
);

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

const EventCard = ({
	event,
	startHour,
}: {
	event: ScheduleEvent;
	startHour: number;
}) => {
	const { onEventClick } = useScheduleContext();

	const startMinutes =
		(event.start.getHours() - startHour) * 60 + event.start.getMinutes();
	const durationMinutes = differenceInMinutes(event.end, event.start);

	const top = (startMinutes / 60) * SLOT_HEIGHT_PX;
	const height = (durationMinutes / 60) * SLOT_HEIGHT_PX;

	// Map lesson type to visual variant
	const variantMap: Record<
		string,
		VariantProps<typeof eventCardVariants>["variant"]
	> = {
		[LessonWeek.odd]: "odd",
		[LessonWeek.even]: "even",
	};

	const variant = variantMap[event.type] || "default";

	return (
		<div
			onClick={e => {
				e.stopPropagation();
				onEventClick?.(event);
			}}
			className={cn(eventCardVariants({ variant }))}
			style={{
				top: `${top}px`,
				// Ensure small events remain visible
				height: `${Math.max(height - 2, 24)}px`,
			}}>
			<div className="flex justify-between w-full font-semibold leading-none text-sm">
				<span className="truncate">{event.subject}</span>
				<span className="text-[10px] opacity-70 whitespace-nowrap pl-1">
					{format(event.start, "HH:mm")}
				</span>
			</div>

			<div className="flex flex-col text-[11px] opacity-90 leading-tight gap-0.5 mt-1">
				<div className="flex justify-between items-center">
					<span className="truncate">{event.room}</span>
					<span className="text-[9px] opacity-60">{format(event.end, "HH:mm")}</span>
				</div>
				<div className="truncate opacity-80">{event.teacher}</div>
			</div>

			{height > 50 && (
				<div className="mt-auto self-start">
					<span className="inline-block px-1 rounded-[2px] bg-primary/20 text-[9px] font-bold uppercase tracking-wider">
						{event.type}
					</span>
				</div>
			)}
		</div>
	);
};

const TimeGrid = () => {
	const { events, date } = useScheduleContext();

	// Determine the start and end hours dynamically based on events
	const { minHour, maxHour } = useMemo(() => {
		if (events.length === 0) return { minHour: 6, maxHour: 20 };

		const starts = events.map(e => e.start.getHours());
		const ends = events.map(
			e => e.end.getHours() + (e.end.getMinutes() > 0 ? 1 : 0)
		);

		const min = Math.min(...starts) - 1;
		const max = Math.max(...ends) + 1;

		return {
			minHour: Math.max(0, min),
			maxHour: Math.min(24, max),
		};
	}, [events]);

	const totalHours = maxHour - minHour;
	const ticks = Array.from({ length: totalHours + 1 }, (_, i) => minHour + i);

	return (
		<div className="flex relative h-full overflow-y-auto bg-background border border/50 rounded-md">
			<div
				className="flex w-full relative min-w-65 pt-6"
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
								{hour.toString().padStart(2, "0")}:00
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
							className="absolute w-full border-b border-border/40"
							style={{ top: `${index * SLOT_HEIGHT_PX}px` }}
						/>
					))}

					{/* Events */}
					{events.map(event => (
						<EventCard
							key={event.id}
							event={event}
							startHour={minHour}
						/>
					))}

					<CurrentTimeLine
						minHour={minHour}
						maxHour={maxHour}
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

	// Only display if the viewed date is today
	if (startOfDay(now).getTime() !== startOfDay(date).getTime()) return null;

	const currentHour = now.getHours();

	// Only render if the current time is within the visible grid range
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
