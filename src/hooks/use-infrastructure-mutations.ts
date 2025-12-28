import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
	useBuildingsControllerCreate,
	useBuildingsControllerUpdate,
	useBuildingsControllerRemove,
	getBuildingsControllerFindAllBySchoolQueryKey,
} from "@/api/generated/endpoints/buildings/buildings";
import {
	useFloorsControllerCreate,
	useFloorsControllerUpdate,
	useFloorsControllerRemove,
} from "@/api/generated/endpoints/floors/floors";
import {
	useRoomsControllerCreate,
	useRoomsControllerUpdate,
	useRoomsControllerRemove,
} from "@/api/generated/endpoints/rooms/rooms";
import type {
	BuildingEntity,
	FloorEntity,
	RoomEntity,
} from "@/api/generated/models";

interface MutationContext {
	previousData?: BuildingEntity[];
}

export function useInfrastructureMutations(schoolId: string | undefined) {
	const queryClient = useQueryClient();
	const queryKey = getBuildingsControllerFindAllBySchoolQueryKey(schoolId);

	const performOptimisticUpdate = async (
		updateFn: (oldData: BuildingEntity[]) => BuildingEntity[]
	) => {
		// Cancel outgoing queries so they don't overwrite our optimistic update
		await queryClient.cancelQueries({ queryKey });

		// Save the previous value
		const previousData =
			queryClient.getQueryData<BuildingEntity[]>(queryKey);

		// Update to the new value
		if (previousData) {
			queryClient.setQueryData<BuildingEntity[]>(
				queryKey,
				updateFn(previousData)
			);
		}

		// Return a context object with the previous value
		return { previousData };
	};

	const onError = (
		_err: unknown,
		_vars: unknown,
		context: MutationContext | undefined
	) => {
		if (context?.previousData) {
			queryClient.setQueryData(queryKey, context.previousData);
		}
	};

	const onSettled = () => {
		queryClient.invalidateQueries({ queryKey });
	};

	return {
		createBuilding: useBuildingsControllerCreate({
			mutation: {
				meta: {
					operationContext: "create building",
				},
				onMutate: async vars => {
					const tempBuilding: BuildingEntity = {
						id: `temp-${Date.now()}`,
						name: vars.data.name,
						schoolId: vars.data.schoolId,
						floors: [],
						createdAt: new Date().toISOString(),
						updatedAt: new Date().toISOString(),
						deleted: false,
						deletedAt: null,
					};

					return performOptimisticUpdate(old => [
						...old,
						tempBuilding,
					]);
				},
				onSuccess: () => toast.success("Building created"),
				onError,
				onSettled,
			},
		}),
		updateBuilding: useBuildingsControllerUpdate({
			mutation: {
				meta: {
					operationContext: "update building",
				},
				onMutate: async vars => {
					return performOptimisticUpdate(old =>
						old.map(b =>
							b.id === vars.id ? { ...b, ...vars.data } : b
						)
					);
				},
				onSuccess: () => toast.success("Building updated"),
				onError,
				onSettled,
			},
		}),
		deleteBuilding: useBuildingsControllerRemove({
			mutation: {
				meta: {
					operationContext: "delete building",
				},
				onMutate: async vars => {
					return performOptimisticUpdate(old =>
						old.filter(b => b.id !== vars.id)
					);
				},
				onSuccess: () => toast.success("Building deleted"),
				onError,
				onSettled,
			},
		}),

		createFloor: useFloorsControllerCreate({
			mutation: {
				meta: {
					operationContext: "create floor",
				},
				onMutate: async vars => {
					const tempFloor: FloorEntity = {
						id: `temp-${Date.now()}`,
						number: vars.data.number,
						description: vars.data.description || "",
						buildingId: vars.data.buildingId,
						rooms: [],
						createdAt: new Date().toISOString(),
						updatedAt: new Date().toISOString(),
						deleted: false,
						deletedAt: null,
					};

					return performOptimisticUpdate(old =>
						old.map(building => {
							if (building.id !== vars.data.buildingId)
								return building;
							return {
								...building,
								floors: [...(building.floors || []), tempFloor],
							};
						})
					);
				},
				onSuccess: () => toast.success("Floor created"),
				onError,
				onSettled,
			},
		}),
		updateFloor: useFloorsControllerUpdate({
			mutation: {
				meta: {
					operationContext: "update floor",
				},
				onMutate: async vars => {
					return performOptimisticUpdate(old =>
						old.map(building => ({
							...building,
							floors: building.floors?.map(floor =>
								floor.id === vars.id
									? { ...floor, ...vars.data }
									: floor
							),
						}))
					);
				},
				onSuccess: () => toast.success("Floor updated"),
				onError,
				onSettled,
			},
		}),
		deleteFloor: useFloorsControllerRemove({
			mutation: {
				meta: {
					operationContext: "delete floor",
				},
				onMutate: async vars => {
					return performOptimisticUpdate(old =>
						old.map(building => ({
							...building,
							floors: building.floors?.filter(
								f => f.id !== vars.id
							),
						}))
					);
				},
				onSuccess: () => toast.success("Floor deleted"),
				onError,
				onSettled,
			},
		}),

		createRoom: useRoomsControllerCreate({
			mutation: {
				meta: {
					operationContext: "create room",
				},
				onMutate: async vars => {
					const tempRoom: RoomEntity = {
						id: `temp-${Date.now()}`,
						name: vars.data.name,
						floorId: vars.data.floorId,
						createdAt: new Date().toISOString(),
						updatedAt: new Date().toISOString(),
						deleted: false,
						deletedAt: null,
					};

					return performOptimisticUpdate(old =>
						old.map(building => ({
							...building,
							floors: building.floors?.map(floor => {
								if (floor.id !== vars.data.floorId)
									return floor;
								return {
									...floor,
									rooms: [...(floor.rooms ?? []), tempRoom],
								};
							}),
						}))
					);
				},
				onSuccess: () => toast.success("Room created"),
				onError,
				onSettled,
			},
		}),
		updateRoom: useRoomsControllerUpdate({
			mutation: {
				meta: {
					operationContext: "update room",
				},
				onMutate: async vars => {
					return performOptimisticUpdate(old =>
						old.map(building => ({
							...building,
							floors: building.floors?.map(floor => ({
								...floor,
								rooms: floor.rooms?.map(room =>
									room.id === vars.id
										? { ...room, ...vars.data }
										: room
								),
							})),
						}))
					);
				},
				onSuccess: () => toast.success("Room updated"),
				onError,
				onSettled,
			},
		}),
		deleteRoom: useRoomsControllerRemove({
			mutation: {
				meta: {
					operationContext: "delete room",
				},
				onMutate: async vars => {
					return performOptimisticUpdate(old =>
						old.map(building => ({
							...building,
							floors: building.floors?.map(floor => ({
								...floor,
								rooms: floor.rooms?.filter(
									r => r.id !== vars.id
								),
							})),
						}))
					);
				},
				onSuccess: () => toast.success("Room deleted"),
				onError,
				onSettled,
			},
		}),
	};
}
