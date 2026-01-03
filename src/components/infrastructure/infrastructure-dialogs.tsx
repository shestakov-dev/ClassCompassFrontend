import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type {
	BuildingEntity,
	FloorEntity,
	RoomEntity,
} from "@/api/generated/models";
import type {
	DialogType,
	DialogMode,
	DialogData,
} from "@/types/infrastructure";
import type { FormEvent } from "react";

interface InfrastructureDialogsProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	type: DialogType;
	mode: DialogMode;
	data: DialogData;
	onSubmit: (e: FormEvent<HTMLFormElement>) => void;
}

export function InfrastructureDialogs({
	open,
	onOpenChange,
	type,
	mode,
	data,
	onSubmit,
}: InfrastructureDialogsProps) {
	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>
						{mode === "create" ? "Add" : "Edit"}{" "}
						<span className="capitalize">{type}</span>
					</DialogTitle>
				</DialogHeader>

				<form onSubmit={onSubmit} className="grid gap-4 py-4">
					{type === "building" && (
						<div className="grid gap-2">
							<Label htmlFor="name">Building Name</Label>
							<Input
								id="name"
								name="name"
								defaultValue={(data as BuildingEntity)?.name}
								required
								autoFocus
							/>
						</div>
					)}

					{type === "floor" && (
						<>
							<div className="grid gap-2">
								<Label htmlFor="number">Floor Number</Label>
								<Input
									id="number"
									name="number"
									type="number"
									defaultValue={(data as FloorEntity)?.number}
									required
									autoFocus
								/>
							</div>

							<div className="grid gap-2">
								<Label htmlFor="description">Description</Label>
								<Input
									id="description"
									name="description"
									defaultValue={
										(data as FloorEntity)?.description ?? ""
									}
									placeholder="e.g. Administration"
								/>
							</div>
						</>
					)}

					{type === "room" && (
						<div className="grid gap-2">
							<Label htmlFor="name">Room Name / Number</Label>
							<Input
								id="name"
								name="name"
								defaultValue={(data as RoomEntity)?.name}
								required
								autoFocus
								placeholder="e.g. 101"
							/>
						</div>
					)}

					<DialogFooter>
						<Button
							type="button"
							variant="outline"
							onClick={() => onOpenChange(false)}>
							Cancel
						</Button>
						<Button type="submit">Save</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}

export function DeleteConfirmation({
	open,
	onOpenChange,
	name,
	onConfirm,
}: {
	open: boolean;
	onOpenChange: (o: boolean) => void;
	name: string;
	onConfirm: () => void;
}) {
	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Delete Confirmation</DialogTitle>
					<DialogDescription>
						Are you sure you want to delete{" "}
						<span className="font-medium text-foreground">
							{name}
						</span>
						? This action cannot be undone.
					</DialogDescription>
				</DialogHeader>
				<DialogFooter className="flex flex-row justify-end gap-2">
					<Button
						type="button"
						variant="outline"
						onClick={() => onOpenChange(false)}>
						Cancel
					</Button>
					<Button
						type="button"
						variant="destructive"
						className="hover:bg-destructive/90"
						onClick={onConfirm}>
						Delete
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
