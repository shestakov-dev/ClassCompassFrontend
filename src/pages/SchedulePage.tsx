import { useState } from "react";
import { DailyScheduleViewer } from "@/components/daily-schedule-viewer";
import { type LessonEntity } from "@/api/generated/models";
import { DatePicker } from "@/components/date-picker";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { addDays, subDays } from "date-fns";

// --- MOCK DATA ---
const MOCK_LESSONS: LessonEntity[] = [];

export default function SchedulePage() {
	const [currentDate, setCurrentDate] = useState(new Date());

	return (
		<div className="flex flex-col h-full bg-background">
			<div className="flex-1 flex flex-col w-full max-w-6xl mx-auto p-4 md:p-6 gap-6 min-h-0">
				{/* Header */}
				<div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
					<div>
						<h1 className="text-2xl font-bold tracking-tight">Schedule</h1>
						<p className="text-muted-foreground text-sm">
							View your upcoming classes.
						</p>
					</div>

					{/* External Controls */}
					<div className="flex items-center gap-1 self-start md:self-auto bg-card border rounded-lg p-1 shadow-sm">
						<Button
							variant="secondary"
							size="icon"
							onClick={() => setCurrentDate(subDays(currentDate, 1))}
							className="h-8 w-8 hover:bg-muted hover:text-foreground">
							<ChevronLeft className="h-4 w-4" />
						</Button>

						<div className="w-45 sm:w-50">
							<DatePicker
								variant="secondary"
								date={currentDate}
								setDate={setCurrentDate}
								className="h-8 border-none shadow-none justify-center font-semibold"
								align="center"
							/>
						</div>

						<Button
							variant="secondary"
							size="icon"
							onClick={() => setCurrentDate(addDays(currentDate, 1))}
							className="h-8 w-8 hover:bg-muted hover:text-foreground">
							<ChevronRight className="h-4 w-4" />
						</Button>
					</div>
				</div>

				{/* Calendar Body */}
				<div className="flex-1 min-h-0 flex flex-col">
					<DailyScheduleViewer
						lessons={MOCK_LESSONS}
						date={currentDate}
					/>
				</div>
			</div>
		</div>
	);
}
