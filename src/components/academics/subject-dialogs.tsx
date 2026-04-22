import { useEffect, useEffectEvent } from "react";
import { useForm } from "@tanstack/react-form";
import { z } from "zod";
import { BookOpen } from "lucide-react";

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
import { Field, FieldLabel, FieldError } from "@/components/ui/field";
import { MultiSelectCombobox } from "@/components/ui/multi-select-combobox";
import type { SubjectEntity } from "@/api/generated/models/subjectEntity";
import type { CreateSubjectDto } from "@/api/generated/models/createSubjectDto";
import type { UpdateSubjectDto } from "@/api/generated/models/updateSubjectDto";
import type { UserEntity } from "@/api/generated/models/userEntity";

const subjectSchema = z.object({
	name: z.string().min(1, "Subject name is required"),
});

interface CreateSubjectDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onSubmit: (data: CreateSubjectDto) => void;
	schoolId: string;
	isLoading: boolean;
}

export function CreateSubjectDialog({
	open,
	onOpenChange,
	onSubmit,
	schoolId,
	isLoading,
}: CreateSubjectDialogProps) {
	const form = useForm({
		defaultValues: {
			name: "",
		},
		onSubmit: async ({ value }) => {
			onSubmit({ name: value.name, schoolId });
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
			<DialogContent>
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2">
						<BookOpen className="w-5 h-5 text-chart-3" />
						Create New Subject
					</DialogTitle>

					<DialogDescription>
						Add a new subject to your school
					</DialogDescription>
				</DialogHeader>

				<form
					onSubmit={e => {
						e.preventDefault();
						e.stopPropagation();

						form.handleSubmit();
					}}
					className="space-y-4">
					<form.Field
						name="name"
						validators={{
							onChange: ({ value }) => {
								const result =
									subjectSchema.shape.name.safeParse(value);

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
									Subject Name
								</FieldLabel>
								<Input
									id={field.name}
									name={field.name}
									value={field.state.value}
									onBlur={field.handleBlur}
									onChange={e =>
										field.handleChange(e.target.value)
									}
									placeholder="e.g., Mathematics, History"
									className="focus-visible:border-chart-3 focus-visible:ring-chart-3/50"
								/>
								<FieldError errors={field.state.meta.errors} />
							</Field>
						)}
					/>

					<DialogFooter className="mt-6">
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
									}
									className="bg-chart-3 hover:bg-chart-3/90">
									{isLoading || isSubmitting
										? "Creating..."
										: "Create"}
								</Button>
							)}
						/>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}

interface EditSubjectDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onSubmit: (data: UpdateSubjectDto) => void;
	subjectData: SubjectEntity | null;
	isLoading: boolean;
}

export function EditSubjectDialog({
	open,
	onOpenChange,
	onSubmit,
	subjectData,
	isLoading,
}: EditSubjectDialogProps) {
	const form = useForm({
		defaultValues: {
			name: subjectData?.name ?? "",
		},
		onSubmit: async ({ value }) => {
			onSubmit({ name: value.name });
		},
	});

	const syncFormData = useEffectEvent(() => {
		if (subjectData) {
			form.setFieldValue("name", subjectData.name);
		}
	});

	useEffect(() => {
		if (open) {
			syncFormData();
		}
	}, [subjectData, open]);

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2">
						<BookOpen className="w-5 h-5 text-chart-3" />
						Edit Subject
					</DialogTitle>

					<DialogDescription>
						Update the subject information
					</DialogDescription>
				</DialogHeader>

				<form
					onSubmit={e => {
						e.preventDefault();
						e.stopPropagation();

						form.handleSubmit();
					}}
					className="space-y-4">
					<form.Field
						name="name"
						validators={{
							onChange: ({ value }) => {
								const result =
									subjectSchema.shape.name.safeParse(value);

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
									Subject Name
								</FieldLabel>
								<Input
									id={field.name}
									name={field.name}
									value={field.state.value}
									onBlur={field.handleBlur}
									onChange={e =>
										field.handleChange(e.target.value)
									}
									placeholder="e.g., Mathematics, History"
									className="focus-visible:border-chart-3 focus-visible:ring-chart-3/50"
								/>
								<FieldError errors={field.state.meta.errors} />
							</Field>
						)}
					/>

					<DialogFooter className="mt-6">
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
									}
									className="bg-chart-3 hover:bg-chart-3/90">
									{isLoading || isSubmitting
										? "Saving..."
										: "Save"}
								</Button>
							)}
						/>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}

interface DeleteSubjectDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onConfirm: () => void;
	subjectData: SubjectEntity | null;
	isLoading: boolean;
}

export function DeleteSubjectDialog({
	open,
	onOpenChange,
	onConfirm,
	subjectData,
	isLoading,
}: DeleteSubjectDialogProps) {
	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Delete Subject</DialogTitle>

					<DialogDescription>
						Are you sure you want to delete the subject "
						{subjectData?.name}"? This action cannot be undone.
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
						{isLoading ? "Deleting..." : "Delete"}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}

interface AssignTeachersDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onSubmit: (userIds: string[]) => void;
	subjectData: SubjectEntity | null;
	users: UserEntity[];
	isLoading: boolean;
}

export function AssignTeachersDialog({
	open,
	onOpenChange,
	onSubmit,
	subjectData,
	users,
	isLoading,
}: AssignTeachersDialogProps) {
	const form = useForm({
		defaultValues: {
			userIds: [] as string[],
		},
		onSubmit: async ({ value }) => {
			onSubmit(value.userIds);
		},
	});

	const syncSelectedTeachers = useEffectEvent(() => {
		if (subjectData) {
			const currentTeachers =
				subjectData.teachers?.map(teacher => teacher.userId) ?? [];

			form.setFieldValue("userIds", currentTeachers);
		}
	});

	useEffect(() => {
		if (open) {
			syncSelectedTeachers();
		} else {
			form.reset();
		}
	}, [subjectData, open, form]);

	// Get users who are not students (can be existing teachers or users with no role)
	const eligibleUsers = users.filter(user => !user.student);

	// Create options for combobox
	const teacherOptions = eligibleUsers.map(user => ({
		value: user.id,
		label: `${user.firstName} ${user.lastName}`,
		secondaryLabel: user.email,
	}));

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-2xl">
				<DialogHeader>
					<DialogTitle>
						Assign Teachers to {subjectData?.name}
					</DialogTitle>

					<DialogDescription>
						Select teachers to assign to this subject
					</DialogDescription>
				</DialogHeader>

				<form
					onSubmit={e => {
						e.preventDefault();
						e.stopPropagation();

						form.handleSubmit();
					}}
					className="space-y-4">
					<form.Field
						name="userIds"
						children={field => (
							<Field>
								<MultiSelectCombobox
									items={teacherOptions}
									selectedValues={field.state.value}
									onChange={vals => field.handleChange(vals)}
									placeholder="Select teachers..."
									searchPlaceholder="Search teachers..."
									emptyMessage="No teachers found."
									label="Teachers"
								/>
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
									}
									className="bg-chart-3 hover:bg-chart-3/90">
									{isLoading || isSubmitting
										? "Assigning..."
										: "Assign Teachers"}
								</Button>
							)}
						/>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
