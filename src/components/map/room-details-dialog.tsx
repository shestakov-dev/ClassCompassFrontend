import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
	Empty,
	EmptyDescription,
	EmptyHeader,
	EmptyMedia,
	EmptyTitle,
} from "@/components/ui/empty";
import { LessonCard } from "@/components/schedule/lesson-card";
import type { RoomOccupancy } from "@/types/map";
import { format } from "date-fns";
import { CheckCircle2, Info } from "lucide-react";
import { UTCDate } from "@date-fns/utc";

interface RoomDetailsDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	roomData: RoomOccupancy | null;
	roomDataAttribute: string | null;
	timestamp: Date;
}

export function RoomDetailsDialog({
	open,
	onOpenChange,
	roomData,
	roomDataAttribute,
	timestamp,
}: RoomDetailsDialogProps) {
	const displayName =
		roomData?.room.name ?? roomDataAttribute ?? "Unknown Room";

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-md">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2">
						{displayName}

						{roomData && (
							<Badge
								variant={
									roomData.occupied
										? "destructive"
										: "default"
								}>
								{roomData.occupied ? "Occupied" : "Available"}
							</Badge>
						)}
					</DialogTitle>

					<DialogDescription>
						{format(
							new UTCDate(timestamp),
							"EEE, MMM d 'at' HH:mm"
						)}
					</DialogDescription>
				</DialogHeader>

				{roomData?.occupied ? (
					<div className="space-y-3">
						<Separator />

						<p className="text-sm font-medium text-muted-foreground">
							Current Lesson
						</p>

						<LessonCard
							lesson={roomData.currentLesson}
							showMenu={false}
							showRoom={false}
						/>
					</div>
				) : roomData && !roomData.occupied ? (
					<Empty className="border-0 p-4">
						<EmptyHeader>
							<EmptyMedia variant="icon">
								<CheckCircle2 className="h-8 w-8 text-green-600/50" />
							</EmptyMedia>

							<EmptyTitle className="text-base">
								Available
							</EmptyTitle>

							<EmptyDescription>
								This room is currently available.
							</EmptyDescription>
						</EmptyHeader>
					</Empty>
				) : (
					<Empty className="border-0 p-4">
						<EmptyHeader>
							<EmptyMedia variant="icon">
								<Info className="h-8 w-8 text-muted-foreground/50" />
							</EmptyMedia>

							<EmptyTitle className="text-base">
								No data available
							</EmptyTitle>

							<EmptyDescription>
								Could not find information for this room.
							</EmptyDescription>
						</EmptyHeader>
					</Empty>
				)}
			</DialogContent>
		</Dialog>
	);
}
