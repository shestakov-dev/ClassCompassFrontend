import type {
	BuildingEntity,
	FloorEntity,
	RoomEntity,
} from "@/api/generated/models";

export type DialogType = "building" | "floor" | "room" | null;
export type DialogMode = "create" | "edit";
export type DialogData = Partial<BuildingEntity | FloorEntity | RoomEntity>;

export interface DialogState {
	open: boolean;
	type: DialogType;
	mode: DialogMode;
	data: DialogData;
	// Stores buildingId for floors, or floorId for rooms
	parentId: string | null;
}

export interface DeleteConfirmState {
	open: boolean;
	type: DialogType;
	id: string;
	name: string;
}
