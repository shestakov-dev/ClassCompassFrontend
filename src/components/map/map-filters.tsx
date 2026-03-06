import { Button } from "@/components/ui/button";
import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Filter, ChevronsUpDown, RotateCcw, CalendarOff } from "lucide-react";
import { useState } from "react";
import { TimestampPicker } from "@/components/map/timestamp-picker";

interface MapFiltersProps {
	timestamp: Date;
	onTimestampChange: (timestamp: Date) => void;
	onTimestampReset: () => void;
	ignoreWeek: boolean;
	onIgnoreWeekToggle: () => void;
}

export function MapFilters({
	timestamp,
	onTimestampChange,
	onTimestampReset,
	ignoreWeek,
	onIgnoreWeekToggle,
}: MapFiltersProps) {
	const [isOpen, setIsOpen] = useState(true);

	return (
		<Collapsible
			open={isOpen}
			onOpenChange={setIsOpen}
			className="border rounded-lg bg-card shadow-sm">
			<div className="flex items-center justify-between px-3 py-2">
				<CollapsibleTrigger asChild>
					<Button
						variant="ghost"
						size="sm"
						className="h-auto p-0 font-semibold hover:bg-transparent">
						<span className="flex items-center gap-2">
							<Filter className="h-4 w-4 text-muted-foreground" />

							<span>Map Filters</span>

							<ChevronsUpDown className="h-3 w-3 text-muted-foreground opacity-50" />
						</span>
					</Button>
				</CollapsibleTrigger>
			</div>

			<CollapsibleContent>
				<div className="space-y-2 px-3 pb-3">
					<div className="text-xs font-semibold text-muted-foreground">
						Timestamp
					</div>

					<div className="flex flex-wrap items-center gap-2">
						<TimestampPicker
							timestamp={timestamp}
							onTimestampChange={onTimestampChange}
						/>

						<Button
							variant="outline"
							size="sm"
							onClick={onTimestampReset}
							className="h-8">
							<RotateCcw className="h-3.5 w-3.5 mr-1" />
							Reset
						</Button>

						<Button
							variant={ignoreWeek ? "default" : "outline"}
							size="sm"
							onClick={onIgnoreWeekToggle}
							className="h-8">
							<CalendarOff className="h-3.5 w-3.5 mr-1" />
							Ignore week
						</Button>
					</div>
				</div>
			</CollapsibleContent>
		</Collapsible>
	);
}
