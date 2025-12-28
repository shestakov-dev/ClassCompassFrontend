import { useState, useEffect, useEffectEvent } from "react";
import { Building, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	Sheet,
	SheetContent,
	SheetTrigger,
	SheetHeader,
	SheetTitle,
} from "@/components/ui/sheet";
import { useSession } from "@/context/session-context";
import { Route } from "@/routes/infrastructure";
import { useBuildingsControllerFindAllBySchool } from "@/api/generated/endpoints/buildings/buildings";
import type {
	BuildingEntity,
	FloorEntity,
	RoomEntity,
} from "@/api/generated/models";
import { InfrastructureSidebar } from "@/components/infrastructure/infrastructure-sidebar";
import { InfrastructureMobileMenu } from "@/components/infrastructure/infrastructure-mobile-menu";
import {
	FloorItem,
	EmptyFloorState,
} from "@/components/infrastructure/floor-list";
import { DashedButton } from "@/components/dashed-button";
import {
	InfrastructureDialogs,
	DeleteConfirmation,
} from "@/components/infrastructure/infrastructure-dialogs";
import { useInfrastructureMutations } from "@/hooks/use-infrastructure-mutations";
import type {
	DialogState,
	DeleteConfirmState,
	DialogType,
	DialogMode,
} from "@/types/infrastructure";

export default function InfrastructurePage() {
	const { user } = useSession();
	const { buildingId: selectedBuildingId } = Route.useSearch();
	const navigate = Route.useNavigate();

	const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
	const [openFloorIds, setOpenFloorIds] = useState<string[]>([]);

	const [dialogState, setDialogState] = useState<DialogState>({
		open: false,
		type: null,
		mode: "create",
		data: {},
		parentId: null,
	});
	const [deleteConfirm, setDeleteConfirm] = useState<DeleteConfirmState>({
		open: false,
		type: null,
		id: "",
		name: "",
	});

	const { data: buildings = [] } = useBuildingsControllerFindAllBySchool(
		user?.schoolId ?? "",
		{
			query: {
				enabled: !!user?.schoolId,
				meta: {
					operationContext: "load buildings",
				},
			},
		}
	);

	const mutations = useInfrastructureMutations(user?.schoolId);
	const selectedBuilding = buildings.find(
		building => building.id === selectedBuildingId
	);

	// Select the first building if none is selected
	useEffect(() => {
		if (buildings.length > 0 && !selectedBuildingId) {
			navigate({ search: { buildingId: buildings[0].id } });
		}
	}, [buildings, selectedBuildingId, navigate]);

	useEffectEvent(() => {
		if (selectedBuilding?.floors) {
			setOpenFloorIds(selectedBuilding.floors.map(floor => floor.id));
		}
	});

	const setSelectedBuildingId = (id: string) => {
		navigate({ search: { buildingId: id } });
	};

	const openDialog = (
		type: DialogType,
		mode: DialogMode,
		data: Partial<BuildingEntity | FloorEntity | RoomEntity> = {},
		parentId: string | null = null
	) => {
		setDialogState({ open: true, type, mode, data, parentId });
	};

	const handleDelete = (type: DialogType, id: string, name: string) => {
		setDeleteConfirm({ open: true, type, id, name });
	};

	const handleSave = (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();

		const { type, mode, data, parentId } = dialogState;

		const formData = new FormData(event.currentTarget);
		const formValues = Object.fromEntries(formData.entries());

		if (type === "building") {
			if (mode === "create") {
				mutations.createBuilding.mutate({
					data: {
						name: formValues.name as string,
						schoolId: user?.schoolId ?? "",
					},
				});
			} else {
				mutations.updateBuilding.mutate({
					id: data.id as string,
					data: { name: formValues.name as string },
				});
			}
		} else if (type === "floor") {
			const floorData = {
				number: parseInt(formValues.number as string),
				...(formValues.description
					? { description: formValues.description as string }
					: {}),
			};

			if (mode === "create" && selectedBuildingId) {
				mutations.createFloor.mutate({
					data: { ...floorData, buildingId: selectedBuildingId },
				});
			} else {
				mutations.updateFloor.mutate({
					id: data.id as string,
					data: floorData,
				});
			}
		} else if (type === "room") {
			if (mode === "create" && parentId) {
				mutations.createRoom.mutate({
					data: {
						name: formValues.name as string,
						floorId: parentId,
					},
				});
			} else {
				mutations.updateRoom.mutate({
					id: data.id as string,
					data: { name: formValues.name as string },
				});
			}
		}

		setDialogState(prev => ({ ...prev, open: false }));
	};

	const confirmDelete = () => {
		const { type, id } = deleteConfirm;
		if (type === "building") {
			mutations.deleteBuilding.mutate({ id });
			if (selectedBuildingId === id)
				setSelectedBuildingId(
					buildings.find(building => building.id !== id)?.id ?? ""
				);
		} else if (type === "floor") mutations.deleteFloor.mutate({ id });
		else if (type === "room") mutations.deleteRoom.mutate({ id });
		setDeleteConfirm({ open: false, type: null, id: "", name: "" });
	};

	const toggleFloor = (floorId: string) => {
		setOpenFloorIds(previousIds =>
			previousIds.includes(floorId)
				? previousIds.filter(id => id !== floorId)
				: [...previousIds, floorId]
		);
	};

	return (
		<div className="flex flex-1 w-full h-full bg-background text-foreground font-sans overflow-hidden">
			<InfrastructureSidebar
				buildings={buildings}
				selectedId={selectedBuildingId}
				onSelect={setSelectedBuildingId}
				onOpenDialog={openDialog}
				onDelete={(id, name) => handleDelete("building", id, name)}
			/>

			{/* Content Area */}
			<div className="flex-1 flex flex-col min-w-0 overflow-hidden">
				{/* Header / Top Bar */}
				<div className="flex h-14 items-center justify-between border-b bg-background px-4 sm:px-6 shrink-0">
					<div className="flex items-center flex-1 min-w-0">
						<h1 className="text-lg font-semibold truncate">
							{selectedBuilding
								? selectedBuilding.name
								: "Infrastructure Dashboard"}
						</h1>
					</div>

					{/* Mobile Menu */}
					<Sheet
						open={isMobileMenuOpen}
						onOpenChange={setIsMobileMenuOpen}>
						<SheetTrigger asChild>
							<Button size="icon" className="md:hidden">
								<Building className="h-4 w-4" />
							</Button>
						</SheetTrigger>
						<SheetContent side="right" className="w-72">
							<SheetHeader className="text-left">
								<SheetTitle className="flex items-center gap-2">
									<Building className="w-5 h-5 text-primary" />
									<span>Infrastructure</span>
								</SheetTitle>
							</SheetHeader>

							<InfrastructureMobileMenu
								buildings={buildings}
								selectedId={selectedBuildingId}
								onSelect={setSelectedBuildingId}
								onOpenDialog={openDialog}
								onDelete={(id, name) =>
									handleDelete("building", id, name)
								}
								onClose={() => setIsMobileMenuOpen(false)}
							/>
						</SheetContent>
					</Sheet>
				</div>

				{/* List Content */}
				<div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-muted/5">
					{!selectedBuilding ? (
						<div className="flex flex-col h-full items-center justify-center p-8 text-center animate-in fade-in zoom-in-95 duration-300">
							<div className="rounded-full bg-muted p-6 mb-6">
								<Building className="h-10 w-10 text-muted-foreground" />
							</div>

							<h3 className="text-lg font-semibold mb-2">
								No Building Selected
							</h3>

							<p className="text-muted-foreground max-w-sm mb-6">
								Select an existing building or create a new one.
							</p>

							<Button
								onClick={() => openDialog("building", "create")}
								className="gap-2">
								<Plus className="h-4 w-4" /> Create Building
							</Button>
						</div>
					) : (
						<div className="max-w-6xl mx-auto pb-10 space-y-4">
							{!selectedBuilding.floors?.length ? (
								<EmptyFloorState
									onAddFirstFloor={() =>
										openDialog("floor", "create")
									}
								/>
							) : (
								<>
									{selectedBuilding.floors
										.slice()
										.sort((a, b) => a.number - b.number)
										.map(floor => (
											<FloorItem
												key={floor.id}
												floor={floor}
												isOpen={openFloorIds.includes(
													floor.id
												)}
												onToggle={() =>
													toggleFloor(floor.id)
												}
												onEditFloor={() =>
													openDialog(
														"floor",
														"edit",
														floor,
														selectedBuilding.id
													)
												}
												onDeleteFloor={() =>
													handleDelete(
														"floor",
														floor.id,
														`Floor ${floor.number}`
													)
												}
												onAddRoom={() =>
													openDialog(
														"room",
														"create",
														{},
														floor.id
													)
												}
												onEditRoom={room =>
													openDialog(
														"room",
														"edit",
														room,
														floor.id
													)
												}
												onDeleteRoom={room =>
													handleDelete(
														"room",
														room.id,
														room.name
													)
												}
											/>
										))}
									<DashedButton
										onClick={() =>
											openDialog("floor", "create")
										}
										className="w-full h-12 mt-6">
										<Plus className="mr-2 h-4 w-4" />
										Add Floor
									</DashedButton>
								</>
							)}
						</div>
					)}
				</div>
			</div>

			<InfrastructureDialogs
				open={dialogState.open}
				onOpenChange={open =>
					setDialogState(prev => ({ ...prev, open }))
				}
				type={dialogState.type}
				mode={dialogState.mode}
				data={dialogState.data}
				onSubmit={handleSave}
			/>

			<DeleteConfirmation
				open={deleteConfirm.open}
				onOpenChange={open =>
					setDeleteConfirm(prev => ({ ...prev, open }))
				}
				name={deleteConfirm.name}
				onConfirm={confirmDelete}
			/>
		</div>
	);
}
