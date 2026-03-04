import type { LessonEntity, RoomEntity } from "@/api/generated/models";

export interface RoomOccupancy {
	room: RoomEntity;
	occupied: boolean;
	currentLessons: LessonEntity;
}

export type RoomOccupancyMap = Record<string, RoomOccupancy>;
