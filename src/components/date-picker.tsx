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

interface DatePickerProps {
	date: Date;
	setDate: (date: Date) => void;
	className?: string;
	align?: "center" | "start" | "end";
	variant?: React.ComponentProps<typeof Button>["variant"];
	size?: React.ComponentProps<typeof Button>["size"];
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
						"w-full justify-start text-left font-normal transition-all",
						"text-muted-foreground",
						"hover:bg-muted hover:text-foreground",
						"data-[state=open]:bg-muted data-[state=open]:text-foreground",
						"flex flex-row items-center justify-center gap-1 md:gap-2",
						!date && "text-muted-foreground",
						className
					)}>
					<CalendarIcon className="h-4 w-4" />
					{date ? format(date, "PPP") : <span>Pick a date</span>}
				</Button>
			</PopoverTrigger>
			<PopoverContent
				className="w-auto p-0"
				align={align}>
				<Calendar
					mode="single"
					selected={date}
					onSelect={selectedDate => selectedDate && setDate(selectedDate)}
				/>
			</PopoverContent>
		</Popover>
	);
}
