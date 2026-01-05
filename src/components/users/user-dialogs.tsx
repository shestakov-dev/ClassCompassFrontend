"use client";

import { useEffect, useEffectEvent, useState } from "react";
import { useForm } from "@tanstack/react-form";
import { z } from "zod";

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
import { Label } from "@/components/ui/label";
import { Field, FieldLabel, FieldError } from "@/components/ui/field";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { MultiSelectCombobox } from "@/components/ui/multi-select-combobox";
import { type UserWithRoles } from "@/components/users/user-columns";
import { type ClassEntity } from "@/api/generated/models/classEntity";
import { type SubjectEntity } from "@/api/generated/models/subjectEntity";
import { type CreateUserDto } from "@/api/generated/models/createUserDto";
import { type UpdateUserDto } from "@/api/generated/models/updateUserDto";

const userSchema = z.object({
	firstName: z.string().min(1, "First name is required"),
	lastName: z.string().min(1, "Last name is required"),
	email: z.email("Invalid email address"),
});

interface CreateUserDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onSubmit: (data: CreateUserDto) => void;
	schoolId: string;
}

export function CreateUserDialog({
	open,
	onOpenChange,
	onSubmit,
	schoolId,
}: CreateUserDialogProps) {
	const form = useForm({
		defaultValues: {
			firstName: "",
			lastName: "",
			email: "",
		},
		onSubmit: async ({ value }) => {
			onSubmit({ ...value, schoolId });

			form.reset();
		},
	});

	useEffect(() => {
		if (!open) {
			form.reset();
		}
	}, [open, form]);

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-100">
				<DialogHeader>
					<DialogTitle>Create User</DialogTitle>

					<DialogDescription>
						Add a new user to the system. You can assign roles after
						creation.
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
						name="firstName"
						validators={{
							onChange: ({ value }) => {
								const result =
									userSchema.shape.firstName.safeParse(value);

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
								<FieldLabel htmlFor={field.name}>
									First Name
								</FieldLabel>
								<Input
									id={field.name}
									name={field.name}
									value={field.state.value}
									onBlur={field.handleBlur}
									onChange={e =>
										field.handleChange(e.target.value)
									}
								/>
								<FieldError errors={field.state.meta.errors} />
							</Field>
						)}
					/>
					<form.Field
						name="lastName"
						validators={{
							onChange: ({ value }) => {
								const result =
									userSchema.shape.lastName.safeParse(value);

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
								<FieldLabel htmlFor={field.name}>
									Last Name
								</FieldLabel>
								<Input
									id={field.name}
									name={field.name}
									value={field.state.value}
									onBlur={field.handleBlur}
									onChange={e =>
										field.handleChange(e.target.value)
									}
								/>
								<FieldError errors={field.state.meta.errors} />
							</Field>
						)}
					/>
					<form.Field
						name="email"
						validators={{
							onChange: ({ value }) => {
								const result =
									userSchema.shape.email.safeParse(value);

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
								<FieldLabel htmlFor={field.name}>
									Email
								</FieldLabel>
								<Input
									id={field.name}
									name={field.name}
									type="email"
									value={field.state.value}
									onBlur={field.handleBlur}
									onChange={e =>
										field.handleChange(e.target.value)
									}
								/>
								<FieldError errors={field.state.meta.errors} />
							</Field>
						)}
					/>

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
									{isSubmitting
										? "Creating..."
										: "Create User"}
								</Button>
							)}
						/>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}

interface EditUserDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onSubmit: (userId: string, data: UpdateUserDto) => void;
	user: UserWithRoles | null;
}

export function EditUserDialog({
	open,
	onOpenChange,
	onSubmit,
	user,
}: EditUserDialogProps) {
	const form = useForm({
		defaultValues: {
			firstName: user?.firstName ?? "",
			lastName: user?.lastName ?? "",
			email: user?.email ?? "",
		},
		onSubmit: async ({ value }) => {
			if (user) {
				onSubmit(user.id, value);
			}
		},
	});

	const syncFormData = useEffectEvent(() => {
		if (user) {
			form.setFieldValue("firstName", user.firstName);
			form.setFieldValue("lastName", user.lastName);
			form.setFieldValue("email", user.email);
		}
	});

	useEffect(() => {
		if (open) {
			syncFormData();
		}
	}, [user, open]);

	if (!user) {
		return null;
	}

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-100">
				<DialogHeader>
					<DialogTitle>Edit User</DialogTitle>

					<DialogDescription>
						Update user information.
					</DialogDescription>
				</DialogHeader>

				<form
					onSubmit={e => {
						e.preventDefault();
						e.stopPropagation();

						form.handleSubmit();
					}}
					className="grid gap-4 py-4">
					<form.Field
						name="firstName"
						validators={{
							onChange: ({ value }) => {
								const result =
									userSchema.shape.firstName.safeParse(value);

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
								<FieldLabel htmlFor={field.name}>
									First Name
								</FieldLabel>
								<Input
									id={field.name}
									name={field.name}
									value={field.state.value}
									onBlur={field.handleBlur}
									onChange={e =>
										field.handleChange(e.target.value)
									}
								/>
								<FieldError errors={field.state.meta.errors} />
							</Field>
						)}
					/>
					<form.Field
						name="lastName"
						validators={{
							onChange: ({ value }) => {
								const result =
									userSchema.shape.lastName.safeParse(value);

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
								<FieldLabel htmlFor={field.name}>
									Last Name
								</FieldLabel>
								<Input
									id={field.name}
									name={field.name}
									value={field.state.value}
									onBlur={field.handleBlur}
									onChange={e =>
										field.handleChange(e.target.value)
									}
								/>
								<FieldError errors={field.state.meta.errors} />
							</Field>
						)}
					/>
					<form.Field
						name="email"
						validators={{
							onChange: ({ value }) => {
								const result =
									userSchema.shape.email.safeParse(value);

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
								<FieldLabel htmlFor={field.name}>
									Email
								</FieldLabel>
								<Input
									id={field.name}
									name={field.name}
									type="email"
									value={field.state.value}
									onBlur={field.handleBlur}
									onChange={e =>
										field.handleChange(e.target.value)
									}
								/>
								<FieldError errors={field.state.meta.errors} />
							</Field>
						)}
					/>

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
									{isSubmitting
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

interface DeleteUserDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onConfirm: (userId: string) => void;
	user: UserWithRoles | null;
}

export function DeleteUserDialog({
	open,
	onOpenChange,
	onConfirm,
	user,
}: DeleteUserDialogProps) {
	if (!user) {
		return null;
	}

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-100">
				<DialogHeader>
					<DialogTitle>Delete User</DialogTitle>

					<DialogDescription>
						Are you sure you want to delete {user.firstName}{" "}
						{user.lastName}? This action cannot be undone.
					</DialogDescription>
				</DialogHeader>

				<DialogFooter>
					<Button
						variant="outline"
						onClick={() => onOpenChange(false)}>
						Cancel
					</Button>

					<Button
						variant="destructive"
						onClick={() => {
							onConfirm(user.id);
							onOpenChange(false);
						}}>
						Delete
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}

interface ManageRolesDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	user: UserWithRoles | null;
	classes: ClassEntity[];
	subjects: SubjectEntity[];
	onAddStudent: (userId: string, classId: string) => void;
	onRemoveStudent: (studentId: string) => void;
	onUpdateStudent: (studentId: string, classId: string) => void;
	onAddTeacher: (userId: string, subjectIds: string[]) => void;
	onRemoveTeacher: (teacherId: string) => void;
	onUpdateTeacher: (teacherId: string, subjectIds: string[]) => void;
}

export function ManageRolesDialog({
	open,
	onOpenChange,
	user,
	classes,
	subjects,
	onAddStudent,
	onRemoveStudent,
	onUpdateStudent,
	onAddTeacher,
	onRemoveTeacher,
	onUpdateTeacher,
}: ManageRolesDialogProps) {
	// Form for student role (selecting class)
	const studentForm = useForm({
		defaultValues: { classId: "" },
	});

	// Form for teacher role (selecting subjects)
	const teacherForm = useForm({
		defaultValues: { subjectIds: [] as string[] },
	});

	// State to toggle edit modes
	const [isEditingClass, setIsEditingClass] = useState(false);
	const [isEditingSubjects, setIsEditingSubjects] = useState(false);

	const syncRoleData = useEffectEvent(() => {
		if (user?.teacher) {
			const currentSubjectIds =
				user.teacher.subjects?.map(subject => subject.id) ?? [];

			teacherForm.setFieldValue("subjectIds", currentSubjectIds);
		} else {
			teacherForm.setFieldValue("subjectIds", []);
		}

		if (user?.student?.classId) {
			studentForm.setFieldValue("classId", user.student.classId);
		} else {
			studentForm.setFieldValue("classId", "");
		}

		setIsEditingClass(false);
		setIsEditingSubjects(false);
	});

	useEffect(() => {
		if (open) {
			syncRoleData();
		}
	}, [user, open]);

	if (!user) {
		return null;
	}

	const handleAddStudent = () => {
		const classId = studentForm.getFieldValue("classId");

		if (classId) {
			onAddStudent(user.id, classId);
			setIsEditingClass(false);
		}
	};

	const handleUpdateStudent = () => {
		const classId = studentForm.getFieldValue("classId");

		if (user.student && classId) {
			onUpdateStudent(user.student.id, classId);
			setIsEditingClass(false);
		}
	};

	const handleAddTeacher = () => {
		const subjectIds = teacherForm.getFieldValue("subjectIds");

		onAddTeacher(user.id, subjectIds);
		setIsEditingSubjects(false);
	};

	const handleUpdateTeacher = () => {
		const subjectIds = teacherForm.getFieldValue("subjectIds");

		if (user.teacher) {
			onUpdateTeacher(user.teacher.id, subjectIds);
			setIsEditingSubjects(false);
		}
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-125">
				<DialogHeader>
					<DialogTitle>Manage Roles</DialogTitle>

					<DialogDescription>
						Assign or remove roles for {user.firstName}{" "}
						{user.lastName}.
					</DialogDescription>
				</DialogHeader>

				<div className="space-y-6 py-4">
					{/* Student Role Section */}
					<div className="space-y-4">
						<div className="flex items-center justify-between">
							<h3 className="text-sm font-medium">
								Student Role
							</h3>
							{user.student && (
								<div className="flex flex-wrap gap-2 justify-end">
									{isEditingClass ? (
										<Button
											variant="outline"
											size="sm"
											onClick={() => {
												studentForm.setFieldValue(
													"classId",
													user.student?.classId ?? ""
												);
												setIsEditingClass(false);
											}}>
											Cancel Edit
										</Button>
									) : (
										<Button
											variant="outline"
											size="sm"
											onClick={() =>
												setIsEditingClass(true)
											}>
											Edit Class
										</Button>
									)}
									<Button
										variant="destructive"
										size="sm"
										onClick={() =>
											user.student &&
											onRemoveStudent(user.student.id)
										}>
										Remove Student
									</Button>
								</div>
							)}
						</div>

						{!user.student && user.teacher && (
							<p className="text-sm text-muted-foreground italic">
								This user is a teacher. Remove teacher role
								first to add student role.
							</p>
						)}

						{/* Add Student Mode */}
						{!user.student && !user.teacher && (
							<div className="space-y-2">
								<Label>Select Class</Label>
								<div className="flex flex-wrap gap-2">
									<studentForm.Field
										name="classId"
										children={field => (
											<Select
												value={field.state.value}
												onValueChange={
													field.handleChange
												}>
												<SelectTrigger className="w-full sm:w-auto sm:min-w-50">
													<SelectValue placeholder="Choose a class" />
												</SelectTrigger>

												<SelectContent>
													{classes.map(
														currentClass => (
															<SelectItem
																key={
																	currentClass.id
																}
																value={
																	currentClass.id
																}>
																{
																	currentClass.name
																}
															</SelectItem>
														)
													)}
												</SelectContent>
											</Select>
										)}
									/>

									<studentForm.Subscribe
										selector={state => state.values.classId}
										children={classId => (
											<Button
												onClick={handleAddStudent}
												disabled={!classId}
												className="w-full sm:w-auto">
												Add Student
											</Button>
										)}
									/>
								</div>
							</div>
						)}

						{/* View Mode */}
						{user.student && !isEditingClass && (
							<p className="text-sm text-muted-foreground">
								Currently a student in{" "}
								<span className="font-medium">
									{classes.find(
										currentClass =>
											currentClass.id ===
											user.student?.classId
									)?.name ?? "Unknown Class"}
								</span>
							</p>
						)}

						{/* Edit Mode */}
						{user.student && isEditingClass && (
							<div className="space-y-2">
								<Label>Change Class</Label>
								<div className="flex flex-wrap gap-2">
									<studentForm.Field
										name="classId"
										children={field => (
											<Select
												value={field.state.value}
												onValueChange={
													field.handleChange
												}>
												<SelectTrigger className="w-full sm:w-auto sm:min-w-50">
													<SelectValue placeholder="Choose a class" />
												</SelectTrigger>

												<SelectContent>
													{classes.map(
														currentClass => (
															<SelectItem
																key={
																	currentClass.id
																}
																value={
																	currentClass.id
																}>
																{
																	currentClass.name
																}
															</SelectItem>
														)
													)}
												</SelectContent>
											</Select>
										)}
									/>

									<studentForm.Subscribe
										selector={state => state.values.classId}
										children={classId => (
											<Button
												onClick={handleUpdateStudent}
												disabled={
													!classId ||
													classId ===
														user.student?.classId
												}
												className="w-full sm:w-auto">
												Save
											</Button>
										)}
									/>
								</div>
							</div>
						)}
					</div>

					<Separator />

					{/* Teacher Role Section */}
					<div className="space-y-4">
						<div className="flex items-center justify-between">
							<h3 className="text-sm font-medium">
								Teacher Role
							</h3>
							{user.teacher && (
								<div className="flex flex-wrap gap-2 justify-end">
									{isEditingSubjects ? (
										<Button
											variant="outline"
											size="sm"
											onClick={() => {
												const currentIds =
													user.teacher?.subjects?.map(
														subject => subject.id
													) ?? [];

												teacherForm.setFieldValue(
													"subjectIds",
													currentIds
												);

												setIsEditingSubjects(false);
											}}>
											Cancel Edit
										</Button>
									) : (
										<Button
											variant="outline"
											size="sm"
											onClick={() => {
												setIsEditingSubjects(true);
											}}>
											Edit Subjects
										</Button>
									)}
									<Button
										variant="destructive"
										size="sm"
										onClick={() =>
											user.teacher &&
											onRemoveTeacher(user.teacher.id)
										}>
										Remove Teacher
									</Button>
								</div>
							)}
						</div>

						{/* Add Teacher Mode */}
						{!user.teacher && !user.student && (
							<div className="space-y-2">
								<teacherForm.Field
									name="subjectIds"
									children={field => (
										<MultiSelectCombobox
											items={subjects.map(subject => ({
												value: subject.id,
												label: subject.name,
											}))}
											selectedValues={field.state.value}
											onChange={field.handleChange}
											label="Select Subjects"
											placeholder="Choose subjects"
											searchPlaceholder="Search subjects..."
											emptyMessage="No subjects found."
											maxShownItems={3}
										/>
									)}
								/>

								<Button
									onClick={handleAddTeacher}
									className="w-full">
									Add Teacher
								</Button>
							</div>
						)}

						{!user.teacher && user.student && (
							<p className="text-sm text-muted-foreground">
								Cannot add teacher role - user is already a
								student.
							</p>
						)}

						{/* Edit Teacher Mode */}
						{user.teacher && isEditingSubjects && (
							<div className="space-y-2">
								<Label>Select Subjects</Label>
								<div className="flex flex-wrap gap-2">
									<div className="flex-1 min-w-50">
										<teacherForm.Field
											name="subjectIds"
											children={field => (
												<MultiSelectCombobox
													items={subjects.map(
														subject => ({
															value: subject.id,
															label: subject.name,
														})
													)}
													selectedValues={
														field.state.value
													}
													onChange={
														field.handleChange
													}
													placeholder="Choose subjects"
													searchPlaceholder="Search subjects..."
													emptyMessage="No subjects found."
													maxShownItems={3}
												/>
											)}
										/>
									</div>
									<Button
										onClick={handleUpdateTeacher}
										className="w-full sm:w-auto">
										Save
									</Button>
								</div>
							</div>
						)}

						{/* View Teacher Mode */}
						{user.teacher && !isEditingSubjects && (
							<div className="space-y-2">
								<p className="text-sm text-muted-foreground">
									Currently teaching:
								</p>
								<div className="flex flex-wrap gap-1">
									{user.teacher.subjects &&
									user.teacher.subjects.length > 0 ? (
										user.teacher.subjects.map(subject => (
											<Badge
												key={subject.id}
												variant="secondary"
												className="font-normal">
												{subject.name}
											</Badge>
										))
									) : (
										<span className="text-xs text-muted-foreground italic">
											No subjects assigned (Click Edit to
											add)
										</span>
									)}
								</div>
							</div>
						)}
					</div>
				</div>

				<DialogFooter>
					<Button
						variant="outline"
						onClick={() => onOpenChange(false)}>
						Close
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}

interface InviteUserDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onConfirm: (userId: string, ttlSeconds?: number) => void;
	user: UserWithRoles | null;
	isBulk?: boolean;
	userCount?: number;
}

export function InviteUserDialog({
	open,
	onOpenChange,
	onConfirm,
	user,
	isBulk = false,
	userCount = 1,
}: InviteUserDialogProps) {
	const form = useForm({
		defaultValues: {
			// Default to 30 days
			ttlSeconds: 2_592_000,
		},
		onSubmit: async ({ value }) => {
			if (user) {
				onConfirm(user.id, value.ttlSeconds);
				onOpenChange(false);
			}
		},
	});

	useEffect(() => {
		if (open) form.setFieldValue("ttlSeconds", 2_592_000);
	}, [open, form]);

	if (!user) {
		return null;
	}

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-100">
				<DialogHeader>
					<DialogTitle>Send Invite</DialogTitle>

					<DialogDescription>
						{isBulk
							? `Send invitation emails to ${userCount} users.`
							: `Send an invitation email to ${user.firstName} ${user.lastName} at ${user.email}.`}
					</DialogDescription>
				</DialogHeader>

				<form
					onSubmit={e => {
						e.preventDefault();
						e.stopPropagation();

						form.handleSubmit();
					}}
					className="grid gap-4 py-4">
					<form.Field
						name="ttlSeconds"
						children={field => (
							<div className="grid gap-2">
								<Label htmlFor={field.name}>
									Invite Valid For (hours)
								</Label>
								<Input
									id={field.name}
									type="number"
									min="1"
									value={field.state.value / 3600}
									onChange={e =>
										field.handleChange(
											Number(e.target.value) * 3600
										)
									}
								/>
								<p className="text-xs text-muted-foreground">
									The invite will expire after this many
									hours.
								</p>
							</div>
						)}
					/>

					<DialogFooter>
						<Button
							type="button"
							variant="outline"
							onClick={() => onOpenChange(false)}>
							Cancel
						</Button>

						<Button type="submit">Send Invite</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}

interface ToggleAdminDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onConfirm: () => void;
	user: UserWithRoles | null;
	currentUser: UserWithRoles | null;
}

export function ToggleAdminDialog({
	open,
	onOpenChange,
	onConfirm,
	user,
	currentUser,
}: ToggleAdminDialogProps) {
	if (!user) {
		return null;
	}

	const isPromoting = !user.isAdmin;
	const isSelf = currentUser?.id === user.id;

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-100">
				<DialogHeader>
					<DialogTitle>
						{isPromoting ? "Promote to Admin" : "Demote from Admin"}
					</DialogTitle>

					<DialogDescription>
						{isPromoting
							? `Are you sure you want to grant admin privileges to ${user.firstName} ${user.lastName}?`
							: `Are you sure you want to remove admin privileges from ${user.firstName} ${user.lastName}?`}
					</DialogDescription>
				</DialogHeader>
				<DialogFooter>
					<Button
						variant="outline"
						onClick={() => onOpenChange(false)}>
						Cancel
					</Button>

					<Tooltip>
						<TooltipTrigger asChild>
							<span className="inline-block">
								<Button
									disabled={isSelf && !isPromoting}
									onClick={() => {
										onConfirm();
										onOpenChange(false);
									}}>
									Confirm
								</Button>
							</span>
						</TooltipTrigger>
						{isSelf && !isPromoting && (
							<TooltipContent>
								<p>You cannot demote yourself from admin</p>
							</TooltipContent>
						)}
					</Tooltip>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
