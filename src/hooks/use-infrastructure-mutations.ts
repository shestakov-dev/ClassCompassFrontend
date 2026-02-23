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
		_variables: unknown,
		context: MutationContext | undefined
	) => {
		// Rollback to the previous value if available
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
				onMutate: async variables => {
					const tempBuilding: BuildingEntity = {
						id: `temp-${Date.now()}`,
						name: variables.data.name,
						schoolId: variables.data.schoolId,
						floors: [],
						createdAt: new Date().toISOString(),
						updatedAt: new Date().toISOString(),
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
				onMutate: async variables => {
					return performOptimisticUpdate(old =>
						old.map(building =>
							building.id === variables.id
								? { ...building, ...variables.data }
								: building
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
				onMutate: async variables => {
					return performOptimisticUpdate(old =>
						old.filter(building => building.id !== variables.id)
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
				onMutate: async variables => {
					const tempFloor: FloorEntity = {
						id: `temp-${Date.now()}`,
						number: variables.data.number,
						description: variables.data.description ?? "",
						floorPlanETag: null,
						buildingId: variables.data.buildingId,
						rooms: [],
						createdAt: new Date().toISOString(),
						updatedAt: new Date().toISOString(),
					};

					return performOptimisticUpdate(old =>
						old.map(building => {
							if (building.id !== variables.data.buildingId)
								return building;
							return {
								...building,
								floors: [...(building.floors ?? []), tempFloor],
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
				onMutate: async variables => {
					return performOptimisticUpdate(old =>
						old.map(building => ({
							...building,
							floors: building.floors?.map(floor =>
								floor.id === variables.id
									? { ...floor, ...variables.data }
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
				onMutate: async variables => {
					return performOptimisticUpdate(old =>
						old.map(building => ({
							...building,
							floors: building.floors?.filter(
								floor => floor.id !== variables.id
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
				onMutate: async variables => {
					const tempRoom: RoomEntity = {
						id: `temp-${Date.now()}`,
						name: variables.data.name,
						floorId: variables.data.floorId,
						createdAt: new Date().toISOString(),
						updatedAt: new Date().toISOString(),
					};

					return performOptimisticUpdate(old =>
						old.map(building => ({
							...building,
							floors: building.floors?.map(floor => {
								if (floor.id !== variables.data.floorId)
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
				onMutate: async variables => {
					return performOptimisticUpdate(old =>
						old.map(building => ({
							...building,
							floors: building.floors?.map(floor => ({
								...floor,
								rooms: floor.rooms?.map(room =>
									room.id === variables.id
										? { ...room, ...variables.data }
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
				onMutate: async variables => {
					return performOptimisticUpdate(old =>
						old.map(building => ({
							...building,
							floors: building.floors?.map(floor => ({
								...floor,
								rooms: floor.rooms?.filter(
									room => room.id !== variables.id
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
