import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import type { ComponentProps } from "react";

interface DatePickerProps {
	date: Date;
	setDate: (date: Date) => void;
	className?: string;
	align?: "center" | "start" | "end";
	variant?: ComponentProps<typeof Button>["variant"];
	size?: ComponentProps<typeof Button>["size"];
}

export function DatePicker({
	date,
	setDate,
	className,
	align = "start",
	variant = "ghost",
	size = "sm",
}: DatePickerProps) {
	return (
		<Popover>
			<PopoverTrigger asChild>
				<Button
					variant={variant}
					size={size}
					className={cn(
						"group w-auto justify-start text-left font-normal transition-all",
						"border bg-input/30",
						"hover:bg-muted",
						"data-[state=open]:bg-muted",
						"flex flex-row items-center justify-center gap-1 md:gap-2",
						className
					)}>
					<CalendarIcon className="h-4 w-4 text-muted-foreground" />
					{date ? (
						<span className="text-foreground font-medium">
							{format(date, "PPP")}
						</span>
					) : (
						<span className="text-muted-foreground">
							Pick a date
						</span>
					)}
					<ChevronDown className="h-3.5 w-3.5 text-muted-foreground opacity-50 transition-transform duration-200 group-data-[state=open]:rotate-180" />
				</Button>
			</PopoverTrigger>
			<PopoverContent className="w-auto p-0" align={align}>
				<Calendar
					mode="single"
					selected={date}
					onSelect={selectedDate =>
						selectedDate && setDate(selectedDate)
					}
				/>
			</PopoverContent>
		</Popover>
	);
}
