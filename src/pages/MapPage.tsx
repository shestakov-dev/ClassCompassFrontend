import { useCallback, useMemo, useState } from "react";
import { keepPreviousData } from "@tanstack/react-query";
import { useSchool } from "@/context/school-context";
import { SchoolRequired } from "@/components/common/school-required";
import { Spinner } from "@/components/ui/spinner";
import {
	Empty,
	EmptyContent,
	EmptyDescription,
	EmptyHeader,
	EmptyMedia,
	EmptyTitle,
} from "@/components/ui/empty";
import { Map as MapIcon } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { useBuildingsControllerFindAllBySchool } from "@/api/generated/endpoints/buildings/buildings";
import { useFloorsControllerFindAllByBuilding } from "@/api/generated/endpoints/floors/floors";
import { useFloorsControllerGetFloorPlan } from "@/api/generated/endpoints/floors/floors";
import { useRoomsControllerFindAllByFloor } from "@/api/generated/endpoints/rooms/rooms";
import { useLessonsControllerFindFiltered } from "@/api/generated/endpoints/lessons/lessons";
import { BuildingSelector } from "@/components/map/building-selector";
import { FloorSelector } from "@/components/map/floor-selector";
import { FloorPlanViewer } from "@/components/map/floor-plan-viewer";
import { RoomDetailsDialog } from "@/components/map/room-details-dialog";
import { MapFilters } from "@/components/map/map-filters";
import type { RoomOccupancy, RoomOccupancyMap } from "@/types/map";
import type { FloorEntity } from "@/api/generated/models";
import { createLessonFilters } from "@/lib/schedule-utils";
import { Route } from "@/routes/map";

export default function MapPage() {
	const { schoolId } = useSchool();

	const search = Route.useSearch();
	const navigate = Route.useNavigate();

	// Timestamp state from URL or default to now
	const timestamp = useMemo(
		() => (search.timestamp ? new Date(search.timestamp) : new Date()),
		[search.timestamp]
	);

	const selectedBuildingId = search.buildingId;
	const selectedFloorId = search.floorId;

	// Room details dialog state
	const [roomDialogOpen, setRoomDialogOpen] = useState(false);
	const [selectedRoomData, setSelectedRoomData] =
		useState<RoomOccupancy | null>(null);
	const [selectedRoomAttribute, setSelectedRoomAttribute] = useState<
		string | null
	>(null);

	const { data: buildings, isLoading: buildingsLoading } =
		useBuildingsControllerFindAllBySchool(schoolId!, {
			query: {
				enabled: !!schoolId,
				staleTime: 1000 * 60 * 5,
			},
		});

	const { data: floors, isLoading: floorsLoading } =
		useFloorsControllerFindAllByBuilding(selectedBuildingId!, {
			query: {
				enabled: !!selectedBuildingId,
				staleTime: 1000 * 60 * 5,
			},
		});

	const sortedFloors = useMemo(
		() =>
			floors
				? [...floors].sort(
						(floor1, floor2) => floor1.number - floor2.number
					)
				: [],
		[floors]
	);

	const selectedFloor = useMemo(
		() => sortedFloors.find(floor => floor.id === selectedFloorId),
		[sortedFloors, selectedFloorId]
	);

	const { data: floorPlanData } = useFloorsControllerGetFloorPlan(
		selectedFloorId!,
		{
			query: {
				enabled: !!selectedFloorId && !!selectedFloor?.floorPlanETag,
				staleTime: 1000 * 60 * 10,
			},
		}
	);

	const { data: rooms } = useRoomsControllerFindAllByFloor(selectedFloorId!, {
		query: {
			enabled: !!selectedFloorId,
			staleTime: 1000 * 60 * 5,
		},
	});

	const ignoreWeek = search.ignoreWeek ?? false;

	const lessonFilters = useMemo(
		() => createLessonFilters(timestamp, ignoreWeek),
		[timestamp, ignoreWeek]
	);

	const { data: lessons } = useLessonsControllerFindFiltered(
		schoolId!,
		lessonFilters,
		{
			query: {
				enabled: !!schoolId,
				staleTime: 1000 * 60 * 1,
				placeholderData: keepPreviousData,
			},
		}
	);

	// Build room occupancy map: data-room attribute to occupancy
	const occupancy: RoomOccupancyMap = useMemo(() => {
		if (!rooms) {
			return {};
		}

		const map: RoomOccupancyMap = {};

		for (const room of rooms) {
			const roomLessons = (lessons ?? []).filter(
				lesson => lesson.roomId === room.id
			);

			// Only one lesson can happen in a room at a time
			const currentLesson = roomLessons[0];

			map[room.name] = currentLesson
				? { room, occupied: true, currentLesson }
				: { room, occupied: false };
		}

		return map;
	}, [rooms, lessons]);

	const updateSearch = useCallback(
		(params: Partial<typeof search>) => {
			navigate({
				search: (previousSearch: typeof search) => ({
					...previousSearch,
					...params,
				}),
				replace: true,
			});
		},
		[navigate]
	);

	const handleBuildingSelect = useCallback(
		(buildingId: string) => {
			updateSearch({ buildingId, floorId: undefined });
		},
		[updateSearch]
	);

	const handleFloorSelect = useCallback(
		(floorId: string) => {
			updateSearch({ floorId });
		},
		[updateSearch]
	);

	const handleTimestampChange = useCallback(
		(timestamp: Date) => {
			updateSearch({ timestamp: timestamp.toISOString() });
		},
		[updateSearch]
	);

	const handleIgnoreWeekToggle = useCallback(() => {
		updateSearch({ ignoreWeek: ignoreWeek ? undefined : true });
	}, [updateSearch, ignoreWeek]);

	const handleTimestampReset = useCallback(() => {
		updateSearch({ timestamp: undefined });
	}, [updateSearch]);

	const handleRoomClick = useCallback(
		(
			roomDataAttribute: string,
			roomOccupancy: RoomOccupancyMap[string] | undefined
		) => {
			setSelectedRoomAttribute(roomDataAttribute);
			setSelectedRoomData(roomOccupancy ?? null);

			setRoomDialogOpen(true);
		},
		[]
	);

	const handleStairwayClick = useCallback(
		(direction: "up" | "down") => {
			if (!sortedFloors.length || !selectedFloorId) {
				return;
			}

			const currentIndex = sortedFloors.findIndex(
				floor => floor.id === selectedFloorId
			);

			if (currentIndex === -1) {
				return;
			}

			let targetFloor: FloorEntity | undefined;

			if (direction === "up" && currentIndex < sortedFloors.length - 1) {
				targetFloor = sortedFloors[currentIndex + 1];
			} else if (direction === "down" && currentIndex > 0) {
				targetFloor = sortedFloors[currentIndex - 1];
			}

			if (targetFloor) {
				handleFloorSelect(targetFloor.id);
			}
		},
		[sortedFloors, selectedFloorId, handleFloorSelect]
	);

	const isLoading = buildingsLoading || floorsLoading;

	return (
		<SchoolRequired>
			<div className="flex flex-col h-full bg-background">
				<div className="flex-1 flex flex-col w-full max-w-7xl mx-auto p-4 md:p-6 gap-4 min-h-0">
					{/* Header */}
					<div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
						<div>
							<h1 className="text-2xl font-bold tracking-tight">
								Map
							</h1>

							<p className="text-muted-foreground text-sm">
								Explore buildings and rooms
							</p>
						</div>
					</div>

					{/* Building & Floor selectors */}
					<div className="flex items-center gap-4 flex-wrap border rounded-lg bg-card p-2 shadow-sm shrink-0 h-12">
						{buildings && buildings.length > 0 && (
							<>
								<BuildingSelector
									buildings={buildings}
									selectedBuildingId={selectedBuildingId}
									onSelect={handleBuildingSelect}
								/>

								{sortedFloors.length > 0 && (
									<>
										<Separator orientation="vertical" />

										<FloorSelector
											floors={sortedFloors}
											selectedFloorId={selectedFloorId}
											onSelect={handleFloorSelect}
										/>
									</>
								)}
							</>
						)}
					</div>

					{/* Filters panel */}
					<div className="shrink-0">
						<MapFilters
							timestamp={timestamp}
							onTimestampChange={handleTimestampChange}
							onTimestampReset={handleTimestampReset}
							ignoreWeek={ignoreWeek}
							onIgnoreWeekToggle={handleIgnoreWeekToggle}
						/>
					</div>

					{/* Map Area */}
					<div className="flex-1 min-h-0 border rounded-lg bg-card shadow-sm overflow-hidden flex">
						{isLoading ? (
							<div className="flex-1 flex items-center justify-center">
								<div className="flex flex-col items-center gap-2">
									<Spinner className="h-8 w-8 text-primary" />

									<p className="text-xs text-muted-foreground font-medium">
										Loading map...
									</p>
								</div>
							</div>
						) : !buildings || buildings.length === 0 ? (
							<div className="flex-1 flex items-center justify-center">
								<Empty>
									<EmptyHeader>
										<EmptyMedia variant="icon">
											<MapIcon className="h-10 w-10 text-muted-foreground/50" />
										</EmptyMedia>

										<EmptyTitle>
											No buildings found
										</EmptyTitle>

										<EmptyDescription>
											There are no buildings configured
											for this school. Ask an
											administrator to add buildings and
											floors.
										</EmptyDescription>
									</EmptyHeader>
								</Empty>
							</div>
						) : !selectedBuildingId ? (
							<div className="flex-1 flex items-center justify-center">
								<Empty>
									<EmptyHeader>
										<EmptyMedia variant="icon">
											<MapIcon className="h-10 w-10 text-muted-foreground/50" />
										</EmptyMedia>

										<EmptyTitle>
											No building selected
										</EmptyTitle>

										<EmptyDescription>
											Please select a building to view its
											floors and rooms.
										</EmptyDescription>
									</EmptyHeader>

									<EmptyContent>
										<BuildingSelector
											buildings={buildings!}
											selectedBuildingId={
												selectedBuildingId
											}
											onSelect={handleBuildingSelect}
										/>
									</EmptyContent>
								</Empty>
							</div>
						) : sortedFloors.length === 0 ? (
							<div className="flex-1 flex items-center justify-center">
								<Empty>
									<EmptyHeader>
										<EmptyMedia variant="icon">
											<MapIcon className="h-10 w-10 text-muted-foreground/50" />
										</EmptyMedia>

										<EmptyTitle>No floors found</EmptyTitle>

										<EmptyDescription>
											This building has no floors yet.
										</EmptyDescription>
									</EmptyHeader>
								</Empty>
							</div>
						) : !selectedFloorId ? (
							<div className="flex-1 flex items-center justify-center">
								<Empty>
									<EmptyHeader>
										<EmptyMedia variant="icon">
											<MapIcon className="h-10 w-10 text-muted-foreground/50" />
										</EmptyMedia>

										<EmptyTitle>
											No floor selected
										</EmptyTitle>

										<EmptyDescription>
											Please select a floor to view its
											layout and room occupancy.
										</EmptyDescription>
									</EmptyHeader>

									<EmptyContent>
										<FloorSelector
											floors={sortedFloors}
											selectedFloorId={selectedFloorId}
											onSelect={handleFloorSelect}
										/>
									</EmptyContent>
								</Empty>
							</div>
						) : (
							<FloorPlanViewer
								floorPlanUrl={floorPlanData?.url}
								floor={selectedFloor}
								occupancy={occupancy}
								onRoomClick={handleRoomClick}
								onStairwayClick={handleStairwayClick}
							/>
						)}
					</div>
				</div>

				{/* Room Details Dialog */}
				<RoomDetailsDialog
					open={roomDialogOpen}
					onOpenChange={setRoomDialogOpen}
					roomData={selectedRoomData}
					roomDataAttribute={selectedRoomAttribute}
					timestamp={timestamp}
				/>
			</div>
		</SchoolRequired>
	);
}
