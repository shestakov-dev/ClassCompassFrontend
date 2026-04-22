import { useEffect, useEffectEvent } from "react";
import { useForm } from "@tanstack/react-form";
import { z } from "zod";
import { School } from "lucide-react";

import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	Field,
	FieldLabel,
	FieldDescription,
	FieldError,
} from "@/components/ui/field";
import type { SchoolEntity } from "@/api/generated/models/schoolEntity";
import type { CreateSchoolDto } from "@/api/generated/models/createSchoolDto";
import type { UpdateSchoolDto } from "@/api/generated/models/updateSchoolDto";

const schoolSchema = z.object({
	name: z.string().min(1, "School name is required"),
});

interface CreateSchoolDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onSubmit: (data: CreateSchoolDto) => void;
	isLoading: boolean;
}

export function CreateSchoolDialog({
	open,
	onOpenChange,
	onSubmit,
	isLoading,
}: CreateSchoolDialogProps) {
	const form = useForm({
		defaultValues: {
			name: "",
		},
		onSubmit: async ({ value }) => {
			onSubmit({ name: value.name });
		},
	});

	const resetForm = useEffectEvent(() => {
		form.reset();
	});

	useEffect(() => {
		if (!open) {
			resetForm();
		}
	}, [open]);

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2">
						<School className="w-5 h-5 text-primary" />
						Create School
					</DialogTitle>

					<DialogDescription>
						Add a new educational institution to the system.
					</DialogDescription>
				</DialogHeader>

				<form
					onSubmit={e => {
						e.preventDefault();
						e.stopPropagation();
						form.handleSubmit();
					}}
					className="space-y-6">
					<form.Field
						name="name"
						validators={{
							onChange: ({ value }) => {
								const result =
									schoolSchema.shape.name.safeParse(value);

								return result.success
									? undefined
									: {
											message:
												result.error.issues[0].message,
										};
							},
						}}
						children={field => (
							<Field>
								<FieldLabel htmlFor={field.name} className="after:content-['*'] after:ml-0.5 after:text-destructive">
									School Name
								</FieldLabel>
								<Input
									id={field.name}
									name={field.name}
									value={field.state.value}
									onBlur={field.handleBlur}
									onChange={e =>
										field.handleChange(e.target.value)
									}
									placeholder="e.g. Springfield High School"
								/>
								<FieldDescription>
									This will be the unique display name for the
									institution.
								</FieldDescription>
								<FieldError errors={field.state.meta.errors} />
							</Field>
						)}
					/>

					<DialogFooter>
						<Button
							type="button"
							variant="outline"
							onClick={() => onOpenChange(false)}
							disabled={isLoading}>
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
									disabled={
										!canSubmit || isSubmitting || isLoading
									}>
									{isLoading || isSubmitting
										? "Creating..."
										: "Create School"}
								</Button>
							)}
						/>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}

interface EditSchoolDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onSubmit: (data: UpdateSchoolDto) => void;
	school: SchoolEntity | null;
	isLoading: boolean;
}

export function EditSchoolDialog({
	open,
	onOpenChange,
	onSubmit,
	school,
	isLoading,
}: EditSchoolDialogProps) {
	const form = useForm({
		defaultValues: {
			name: school?.name ?? "",
		},
		onSubmit: async ({ value }) => {
			onSubmit({ name: value.name });
		},
	});

	// Update form values when school changes
	useEffect(() => {
		if (school) {
			form.setFieldValue("name", school.name);
		}
	}, [school, form]);

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2">
						<School className="w-5 h-5 text-primary" />
						Edit School
					</DialogTitle>

					<DialogDescription>
						Update the details of the educational institution.
					</DialogDescription>
				</DialogHeader>

				<form
					onSubmit={e => {
						e.preventDefault();
						e.stopPropagation();

						form.handleSubmit();
					}}
					className="space-y-6">
					<form.Field
						name="name"
						validators={{
							onChange: ({ value }) => {
								const result =
									schoolSchema.shape.name.safeParse(value);

								return result.success
									? undefined
									: {
											message:
												result.error.issues[0].message,
										};
							},
						}}
						children={field => (
							<Field>
								<FieldLabel htmlFor={field.name} className="after:content-['*'] after:ml-0.5 after:text-destructive">
									School Name
								</FieldLabel>
								<Input
									id={field.name}
									name={field.name}
									value={field.state.value}
									onBlur={field.handleBlur}
									onChange={e =>
										field.handleChange(e.target.value)
									}
									placeholder="e.g. Springfield High School"
								/>
								<FieldDescription>
									This will be the unique display name for the
									institution.
								</FieldDescription>
								<FieldError errors={field.state.meta.errors} />
							</Field>
						)}
					/>

					<DialogFooter>
						<Button
							type="button"
							variant="outline"
							onClick={() => onOpenChange(false)}
							disabled={isLoading}>
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
									disabled={
										!canSubmit || isSubmitting || isLoading
									}>
									{isLoading || isSubmitting
										? "Saving..."
										: "Save Changes"}
								</Button>
							)}
						/>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}

interface DeleteSchoolDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onConfirm: () => void;
	isLoading: boolean;
	school: SchoolEntity | null;
}

export function DeleteSchoolDialog({
	open,
	onOpenChange,
	onConfirm,
	isLoading,
	school,
}: DeleteSchoolDialogProps) {
	if (!school) {
		return null;
	}

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Delete School</DialogTitle>

					<DialogDescription>
						Are you sure you want to delete{" "}
						<strong>{school.name}</strong>? This action cannot be
						undone and will cascade delete all associated data
						(users, classes, lessons, etc.).
					</DialogDescription>
				</DialogHeader>

				<DialogFooter>
					<Button
						variant="outline"
						onClick={() => onOpenChange(false)}
						disabled={isLoading}>
						Cancel
					</Button>

					<Button
						variant="destructive"
						onClick={onConfirm}
						disabled={isLoading}>
						{isLoading ? "Deleting..." : "Delete School"}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
