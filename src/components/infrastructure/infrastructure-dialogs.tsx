import { useEffect, useEffectEvent } from "react";
import { useForm } from "@tanstack/react-form";
import { z } from "zod";

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
import { Field, FieldLabel, FieldError } from "@/components/ui/field";
import type {
	DialogType,
	DialogMode,
	DialogData,
} from "@/types/infrastructure";

const buildingSchema = z.object({
	name: z.string().min(1, "Building name is required"),
});

const floorSchema = z.object({
	// We accept string input to handle the form state,
	// then validate it parses to a number
	number: z
		.string()
		.min(1, "Floor number is required")
		.refine(value => !isNaN(Number(value)), {
			message: "Must be a valid number",
		})
		.transform(value => Number(value)),
	description: z.string().optional(),
});

const roomSchema = z.object({
	name: z.string().min(1, "Room name/number is required"),
});

interface InfrastructureDialogsProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	type: DialogType;
	mode: DialogMode;
	data: DialogData;
	onSubmit: (data: {
		name?: string;
		number?: number;
		description?: string;
	}) => void;
}

export function InfrastructureDialogs({
	open,
	onOpenChange,
	type,
	mode,
	data,
	onSubmit,
}: InfrastructureDialogsProps) {
	const form = useForm({
		defaultValues: {
			name: "",
			number: "",
			description: "",
		},
		onSubmit: async ({ value }) => {
			if (type === "building") {
				onSubmit({ name: value.name });
			} else if (type === "floor") {
				onSubmit({
					number: Number(value.number),
					description: value.description,
				});
			} else if (type === "room") {
				onSubmit({ name: value.name });
			}
		},
	});

	const resetAndFill = useEffectEvent(() => {
		form.reset();

		if (data) {
			if (type === "building" && "name" in data) {
				form.setFieldValue("name", data.name ?? "");
			} else if (type === "floor" && "number" in data) {
				form.setFieldValue("number", data.number?.toString() ?? "");
				const desc = "description" in data ? data.description : "";
				form.setFieldValue("description", desc ?? "");
			} else if (type === "room" && "name" in data) {
				form.setFieldValue("name", data.name ?? "");
			}
		}
	});

	useEffect(() => {
		if (open) {
			resetAndFill();
		}
	}, [open, data, type]);

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>
						{mode === "create" ? "Add" : "Edit"}{" "}
						<span className="capitalize">{type}</span>
					</DialogTitle>
				</DialogHeader>

				<form
					onSubmit={e => {
						e.preventDefault();
						e.stopPropagation();

						form.handleSubmit();
					}}
					className="grid gap-4 py-4">
					{type === "building" && (
						<form.Field
							name="name"
							validators={{
								onChange: ({ value }) => {
									const result =
										buildingSchema.shape.name.safeParse(
											value
										);

									return result.success
										? undefined
										: {
												message:
													result.error.issues[0]
														.message,
											};
								},
							}}
							children={field => (
								<Field>
									<FieldLabel
										htmlFor={field.name}
										className="after:content-['*'] after:ml-0.5 after:text-destructive">
										Building Name
									</FieldLabel>
									<Input
										id={field.name}
										name={field.name}
										value={field.state.value}
										onBlur={field.handleBlur}
										onChange={e =>
											field.handleChange(e.target.value)
										}
										autoFocus
									/>
									{field.state.meta.isTouched && (
										<FieldError
											errors={field.state.meta.errors}
										/>
									)}
								</Field>
							)}
						/>
					)}

					{type === "floor" && (
						<>
							<form.Field
								name="number"
								validators={{
									onChange: ({ value }) => {
										const result =
											floorSchema.shape.number.safeParse(
												value
											);

										return result.success
											? undefined
											: {
													message:
														result.error.issues[0]
															.message,
												};
									},
								}}
								children={field => (
									<Field>
										<FieldLabel
											htmlFor={field.name}
											className="after:content-['*'] after:ml-0.5 after:text-destructive">
											Floor Number
										</FieldLabel>
										<Input
											id={field.name}
											name={field.name}
											type="text"
											inputMode="decimal"
											value={field.state.value}
											onBlur={field.handleBlur}
											onChange={e =>
												field.handleChange(
													e.target.value
												)
											}
											autoFocus
										/>
										{field.state.meta.isTouched && (
											<FieldError
												errors={field.state.meta.errors}
											/>
										)}
									</Field>
								)}
							/>

							<form.Field
								name="description"
								children={field => (
									<Field>
										<FieldLabel htmlFor={field.name}>
											Description
										</FieldLabel>
										<Input
											id={field.name}
											name={field.name}
											value={field.state.value}
											onBlur={field.handleBlur}
											onChange={e =>
												field.handleChange(
													e.target.value
												)
											}
											placeholder="e.g. Administration"
										/>
									</Field>
								)}
							/>
						</>
					)}

					{type === "room" && (
						<form.Field
							name="name"
							validators={{
								onChange: ({ value }) => {
									const result =
										roomSchema.shape.name.safeParse(value);

									return result.success
										? undefined
										: {
												message:
													result.error.issues[0]
														.message,
											};
								},
							}}
							children={field => (
								<Field>
									<FieldLabel
										htmlFor={field.name}
										className="after:content-['*'] after:ml-0.5 after:text-destructive">
										Room Name / Number
									</FieldLabel>
									<Input
										id={field.name}
										name={field.name}
										value={field.state.value}
										onBlur={field.handleBlur}
										onChange={e =>
											field.handleChange(e.target.value)
										}
										autoFocus
										placeholder="e.g. 101"
									/>
									{field.state.meta.isTouched && (
										<FieldError
											errors={field.state.meta.errors}
										/>
									)}
								</Field>
							)}
						/>
					)}

					<DialogFooter>
						<Button
							type="button"
							variant="outline"
							onClick={() => onOpenChange(false)}>
							Cancel
						</Button>

						<form.Subscribe
							selector={state => [
								state.canSubmit,
								state.isSubmitting,
							]}
							children={([canSubmit, isSubmitting]) => (
								<Button
									type="submit"
									disabled={!canSubmit || isSubmitting}>
									{isSubmitting ? "Saving..." : "Save"}
								</Button>
							)}
						/>
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
