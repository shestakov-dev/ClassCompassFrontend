import {
	ChevronRight,
	Edit2,
	Trash2,
	Plus,
	DoorOpen,
	MoreVertical,
	Layers,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DashedButton } from "@/components/dashed-button";
import { cn } from "@/lib/utils";
import type { FloorEntity, RoomEntity } from "@/api/generated/models";

function RoomItem({
	room,
	onEdit,
	onDelete,
}: {
	room: RoomEntity;
	onEdit: () => void;
	onDelete: () => void;
}) {
	return (
		<div className="flex items-center justify-between rounded-md border bg-background p-3 shadow-sm transition-colors hover:border-primary/40 hover:bg-accent/30 group">
			<div className="flex items-center gap-3 min-w-0">
				<div className="rounded p-1.5 text-primary bg-primary/10 shrink-0">
					<DoorOpen className="h-4 w-4" />
				</div>
				<div className="truncate">
					<p
						className="text-sm font-medium truncate"
						title={room.name}>
						{room.name}
					</p>
				</div>
			</div>

			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Button
						variant="ghost"
						size="icon-sm"
						className="h-7 w-7 text-muted-foreground hover:bg-background hover:text-foreground">
						<MoreVertical className="h-3.5 w-3.5" />
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent align="end">
					<DropdownMenuItem
						onClick={onEdit}
						className="cursor-pointer">
						<Edit2 className="mr-2 h-3.5 w-3.5" /> Edit
					</DropdownMenuItem>
					<DropdownMenuItem
						onClick={onDelete}
						className="text-destructive focus:text-destructive cursor-pointer">
						<Trash2 className="mr-2 h-3.5 w-3.5 text-destructive" />{" "}
						Delete
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>
		</div>
	);
}

export function FloorItem({
	floor,
	isOpen,
	onToggle,
	onEditFloor,
	onDeleteFloor,
	onAddRoom,
	onEditRoom,
	onDeleteRoom,
}: {
	floor: FloorEntity;
	isOpen: boolean;
	onToggle: () => void;
	onEditFloor: () => void;
	onDeleteFloor: () => void;
	onAddRoom: () => void;
	onEditRoom: (r: RoomEntity) => void;
	onDeleteRoom: (r: RoomEntity) => void;
}) {
	return (
		<Collapsible
			open={isOpen}
			onOpenChange={onToggle}
			className="border rounded-lg bg-card shadow-sm">
			<div className="flex items-center justify-between p-2">
				<CollapsibleTrigger asChild>
					<div className="flex items-center gap-3 flex-1 cursor-pointer group select-none">
						<Button
							variant="ghost"
							size="icon-sm"
							className="h-6 w-6 shrink-0 text-muted-foreground group-hover:text-foreground">
							<ChevronRight
								className={cn(
									"h-4 w-4 transition-transform duration-200",
									isOpen && "rotate-90"
								)}
							/>
						</Button>
						<div className="flex items-center gap-3">
							<div className="flex h-7 w-7 items-center justify-center rounded border bg-muted/30 font-mono text-xs font-bold text-muted-foreground group-hover:text-foreground group-hover:border-primary/30 transition-colors">
								{floor.number}
							</div>
							<div>
								<span className="font-semibold block text-sm">
									{floor.number === 0
										? "Ground Floor"
										: `Floor ${floor.number}`}
								</span>
								{floor.description && (
									<span className="text-xs text-muted-foreground font-normal">
										{floor.description}
									</span>
								)}
							</div>
						</div>
					</div>
				</CollapsibleTrigger>
				<div className="flex items-center gap-1">
					<Button
						variant="ghost"
						size="icon-sm"
						className="text-muted-foreground hover:text-foreground hover:bg-accent"
						onClick={e => {
							e.stopPropagation();
							onEditFloor();
						}}>
						<Edit2 className="h-4 w-4" />
					</Button>
					<Button
						variant="ghost"
						size="icon-sm"
						className="text-red-500 hover:text-red-500 hover:bg-red-100 dark:hover:bg-red-900/40"
						onClick={e => {
							e.stopPropagation();
							onDeleteFloor();
						}}>
						<Trash2 className="h-4 w-4" />
					</Button>
				</div>
			</div>

			<CollapsibleContent>
				<div className="px-3 pb-4 pt-1">
					{!floor.rooms || floor.rooms.length === 0 ? (
						<div className="flex flex-col items-center justify-center py-8 px-4 border-2 border-dashed rounded-lg bg-muted/20 text-center">
							<div className="bg-background p-3 rounded-full shadow-sm mb-3">
								<DoorOpen className="h-6 w-6 text-muted-foreground" />
							</div>
							<h4 className="text-sm font-semibold mb-1">
								No rooms yet
							</h4>
							<p className="text-xs text-muted-foreground mb-4 max-w-xs">
								Add the first room to this floor.
							</p>
							<Button
								onClick={onAddRoom}
								size="sm"
								className="gap-2">
								<Plus className="h-3.5 w-3.5" /> Add Room
							</Button>
						</div>
					) : (
						<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
							{floor.rooms.map(room => (
								<RoomItem
									key={room.id}
									room={room}
									onEdit={() => onEditRoom(room)}
									onDelete={() => onDeleteRoom(room)}
								/>
							))}
							<DashedButton
								onClick={onAddRoom}
								className="h-full min-h-12 flex items-center justify-center gap-2">
								<Plus className="h-4 w-4" />
								Add Room
							</DashedButton>
						</div>
					)}
				</div>
			</CollapsibleContent>
		</Collapsible>
	);
}

export function EmptyFloorState({
	onAddFirstFloor,
}: {
	onAddFirstFloor: () => void;
}) {
	return (
		<div className="flex flex-col items-center justify-center py-16 px-4 border-2 border-dashed rounded-xl bg-muted/20 text-center animate-in fade-in duration-500">
			<div className="bg-background p-4 rounded-full shadow-sm mb-4">
				<Layers className="h-8 w-8 text-muted-foreground/70" />
			</div>
			<h3 className="text-xl font-semibold mb-2">No floors yet</h3>
			<p className="text-muted-foreground mb-8 max-w-sm">
				This building is empty. Start by adding the first floor.
			</p>
			<Button
				size="lg"
				onClick={onAddFirstFloor}
				className="w-full sm:w-auto min-w-35 cursor-pointer">
				<Plus className="mr-2 h-4 w-4" /> Add First Floor
			</Button>
		</div>
	);
}
