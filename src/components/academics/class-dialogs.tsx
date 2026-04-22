import { useEffect, useEffectEvent } from "react";
import { useForm } from "@tanstack/react-form";
import { z } from "zod";
import { GraduationCap } from "lucide-react";

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
import type { ClassEntity } from "@/api/generated/models/classEntity";
import type { CreateClassDto } from "@/api/generated/models/createClassDto";
import type { UpdateClassDto } from "@/api/generated/models/updateClassDto";
import type { StudentEntity } from "@/api/generated/models/studentEntity";
import type { UserEntity } from "@/api/generated/models/userEntity";

const classSchema = z.object({
	name: z.string().min(1, "Class name is required"),
});

interface CreateClassDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onSubmit: (data: CreateClassDto) => void;
	schoolId: string;
	isLoading: boolean;
}

export function CreateClassDialog({
	open,
	onOpenChange,
	onSubmit,
	schoolId,
	isLoading,
}: CreateClassDialogProps) {
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
						<GraduationCap className="w-5 h-5 text-chart-4" />
						Create New Class
					</DialogTitle>

					<DialogDescription>
						Add a new class to your school
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
									classSchema.shape.name.safeParse(value);

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
									Class Name
								</FieldLabel>
								<Input
									id={field.name}
									name={field.name}
									value={field.state.value}
									onBlur={field.handleBlur}
									onChange={e =>
										field.handleChange(e.target.value)
									}
									placeholder="e.g., 10A, Grade 5B"
									className="focus-visible:border-chart-4 focus-visible:ring-chart-4/50"
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
									className="bg-chart-4 hover:bg-chart-4/90">
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

interface EditClassDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onSubmit: (data: UpdateClassDto) => void;
	classData: ClassEntity | null;
	isLoading: boolean;
}

export function EditClassDialog({
	open,
	onOpenChange,
	onSubmit,
	classData,
	isLoading,
}: EditClassDialogProps) {
	const form = useForm({
		defaultValues: {
			name: classData?.name ?? "",
		},
		onSubmit: async ({ value }) => {
			onSubmit({ name: value.name });
		},
	});

	const syncFormData = useEffectEvent(() => {
		if (classData) {
			form.setFieldValue("name", classData.name);
		}
	});

	useEffect(() => {
		if (open) {
			syncFormData();
		}
	}, [classData, open]);

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2">
						<GraduationCap className="w-5 h-5 text-chart-4" />
						Edit Class
					</DialogTitle>

					<DialogDescription>
						Update the class information
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
									classSchema.shape.name.safeParse(value);

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
									Class Name
								</FieldLabel>
								<Input
									id={field.name}
									name={field.name}
									value={field.state.value}
									onBlur={field.handleBlur}
									onChange={e =>
										field.handleChange(e.target.value)
									}
									placeholder="e.g., 10A, Grade 5B"
									className="focus-visible:border-chart-4 focus-visible:ring-chart-4/50"
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
									className="bg-chart-4 hover:bg-chart-4/90">
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

interface DeleteClassDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onConfirm: () => void;
	classData: ClassEntity | null;
	isLoading: boolean;
}

export function DeleteClassDialog({
	open,
	onOpenChange,
	onConfirm,
	classData,
	isLoading,
}: DeleteClassDialogProps) {
	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Delete Class</DialogTitle>

					<DialogDescription>
						Are you sure you want to delete the class "
						{classData?.name}"? This action cannot be undone.
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

interface AssignStudentsDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onSubmit: (userIds: string[]) => void;
	classData: ClassEntity | null;
	students: StudentEntity[];
	users: UserEntity[];
	isLoading: boolean;
}

export function AssignStudentsDialog({
	open,
	onOpenChange,
	onSubmit,
	classData,
	students,
	users,
	isLoading,
}: AssignStudentsDialogProps) {
	const form = useForm({
		defaultValues: {
			userIds: [] as string[],
		},
		onSubmit: async ({ value }) => {
			onSubmit(value.userIds);
		},
	});

	const syncSelectedUsers = useEffectEvent(() => {
		if (classData) {
			const currentUserIds = students
				.filter(student => student.classId === classData.id)
				.map(student => student.userId);

			form.setFieldValue("userIds", currentUserIds);
		}
	});

	useEffect(() => {
		if (open) {
			syncSelectedUsers();
		} else {
			form.reset();
		}
	}, [classData, open, form]);

	// Show users who are not teachers and are not students in other classes
	const eligibleUsers = users
		.filter(user => !user.teacher)
		.filter(user => {
			const studentEntry = students.find(
				student => student.id === user.student?.id
			);

			const isInCurrentClass =
				classData && studentEntry?.classId === classData.id;

			return !studentEntry || isInCurrentClass;
		});

	const userOptions = eligibleUsers.map(user => ({
		value: user.id,
		label: `${user.firstName} ${user.lastName}`,
		secondaryLabel: user.email,
	}));

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-2xl">
				<DialogHeader>
					<DialogTitle>
						Assign Students to {classData?.name}
					</DialogTitle>

					<DialogDescription>
						Select students to assign to this class
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
									items={userOptions}
									selectedValues={field.state.value}
									onChange={vals => field.handleChange(vals)}
									placeholder="Select students..."
									searchPlaceholder="Search students..."
									emptyMessage="No students found."
									label="Students"
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
									className="bg-chart-4 hover:bg-chart-4/90">
									{isLoading || isSubmitting
										? "Assigning..."
										: "Assign Students"}
								</Button>
							)}
						/>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
