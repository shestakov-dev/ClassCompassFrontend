import type { LessonEntity, RoomEntity } from "@/api/generated/models";

export type RoomOccupancy =
	| { room: RoomEntity; occupied: true; currentLesson: LessonEntity }
	| { room: RoomEntity; occupied: false };

export type RoomOccupancyMap = Record<string, RoomOccupancy>;
