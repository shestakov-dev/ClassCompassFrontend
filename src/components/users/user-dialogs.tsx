"use client";

import { useState, useEffect, useEffectEvent, type FormEvent } from "react";
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
	const [formData, setFormData] = useState<CreateUserDto>({
		firstName: "",
		lastName: "",
		email: "",
		schoolId,
	});

	const handleSubmit = (e: FormEvent) => {
		e.preventDefault();

		onSubmit(formData);
		setFormData({
			firstName: "",
			lastName: "",
			email: "",
			schoolId,
		});
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-100">
				<form onSubmit={handleSubmit}>
					<DialogHeader>
						<DialogTitle>Create User</DialogTitle>
						<DialogDescription>
							Add a new user to the system. You can assign roles
							after creation.
						</DialogDescription>
					</DialogHeader>

					<div className="grid gap-4 py-4">
						<div className="grid gap-2">
							<Label htmlFor="firstName">First Name</Label>
							<Input
								id="firstName"
								value={formData.firstName}
								onChange={e =>
									setFormData({
										...formData,
										firstName: e.target.value,
									})
								}
								required
							/>
						</div>

						<div className="grid gap-2">
							<Label htmlFor="lastName">Last Name</Label>
							<Input
								id="lastName"
								value={formData.lastName}
								onChange={e =>
									setFormData({
										...formData,
										lastName: e.target.value,
									})
								}
								required
							/>
						</div>

						<div className="grid gap-2">
							<Label htmlFor="email">Email</Label>
							<Input
								id="email"
								type="email"
								value={formData.email}
								onChange={e =>
									setFormData({
										...formData,
										email: e.target.value,
									})
								}
								required
							/>
						</div>
					</div>

					<DialogFooter>
						<Button
							type="button"
							variant="outline"
							onClick={() => onOpenChange(false)}>
							Cancel
						</Button>
						<Button type="submit">Create User</Button>
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
	const [formData, setFormData] = useState<UpdateUserDto>({
		firstName: user?.firstName ?? "",
		lastName: user?.lastName ?? "",
		email: user?.email ?? "",
	});

	const syncFormData = useEffectEvent(() => {
		if (user) {
			setFormData({
				firstName: user.firstName,
				lastName: user.lastName,
				email: user.email,
			});
		}
	});

	useEffect(() => {
		syncFormData();
	}, [user]);

	const handleSubmit = (e: FormEvent) => {
		e.preventDefault();
		if (user) {
			onSubmit(user.id, formData);
		}
	};

	if (!user) return null;

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-100">
				<form onSubmit={handleSubmit}>
					<DialogHeader>
						<DialogTitle>Edit User</DialogTitle>
						<DialogDescription>
							Update user information.
						</DialogDescription>
					</DialogHeader>

					<div className="grid gap-4 py-4">
						<div className="grid gap-2">
							<Label htmlFor="edit-firstName">First Name</Label>
							<Input
								id="edit-firstName"
								value={formData.firstName}
								onChange={e =>
									setFormData({
										...formData,
										firstName: e.target.value,
									})
								}
							/>
						</div>

						<div className="grid gap-2">
							<Label htmlFor="edit-lastName">Last Name</Label>
							<Input
								id="edit-lastName"
								value={formData.lastName}
								onChange={e =>
									setFormData({
										...formData,
										lastName: e.target.value,
									})
								}
							/>
						</div>

						<div className="grid gap-2">
							<Label htmlFor="edit-email">Email</Label>
							<Input
								id="edit-email"
								type="email"
								value={formData.email}
								onChange={e =>
									setFormData({
										...formData,
										email: e.target.value,
									})
								}
							/>
						</div>
					</div>

					<DialogFooter>
						<Button
							type="button"
							variant="outline"
							onClick={() => onOpenChange(false)}>
							Cancel
						</Button>
						<Button type="submit">Save Changes</Button>
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
	if (!user) return null;

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
	const [selectedClass, setSelectedClass] = useState<string>("");
	const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
	const [isEditingClass, setIsEditingClass] = useState(false);
	const [isEditingSubjects, setIsEditingSubjects] = useState(false);
	const [trackedUserId, setTrackedUserId] = useState<string | null>(null);

	const syncRoleData = useEffectEvent(() => {
		if (user?.teacher) {
			const currentSubjectIds =
				user.teacher.subjects?.map(subject => subject.id) ?? [];
			setSelectedSubjects(currentSubjectIds);
		} else {
			setSelectedSubjects([]);
		}

		if (user?.student?.classId) {
			setSelectedClass(user.student.classId);
		} else {
			setSelectedClass("");
		}

		setIsEditingClass(false);
		setIsEditingSubjects(false);

		if (user?.id !== trackedUserId) {
			setTrackedUserId(user?.id ?? null);
		}
	});

	useEffect(() => {
		syncRoleData();
	}, [user, open, trackedUserId]);

	if (!user) return null;

	const handleAddStudent = () => {
		if (selectedClass) {
			onAddStudent(user.id, selectedClass);
			setIsEditingClass(false);
		}
	};

	const handleUpdateStudent = () => {
		if (user.student && selectedClass) {
			onUpdateStudent(user.student.id, selectedClass);
			setIsEditingClass(false);
		}
	};

	const handleRemoveStudent = () => {
		if (user.student) {
			onRemoveStudent(user.student.id);
		}
	};

	const handleAddTeacher = () => {
		onAddTeacher(user.id, selectedSubjects);
		setIsEditingSubjects(false);
	};

	const handleUpdateTeacher = () => {
		if (user.teacher) {
			onUpdateTeacher(user.teacher.id, selectedSubjects);
			setIsEditingSubjects(false);
		}
	};

	const handleRemoveTeacher = () => {
		if (user.teacher) {
			onRemoveTeacher(user.teacher.id);
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
					{/* Student Role */}
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
												setSelectedClass(
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
										onClick={handleRemoveStudent}>
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

						{!user.student && !user.teacher && (
							<div className="space-y-2">
								<Label htmlFor="class-select">
									Select Class
								</Label>

								<div className="flex flex-wrap gap-2">
									<Select
										value={selectedClass}
										onValueChange={setSelectedClass}>
										<SelectTrigger
											id="class-select"
											className="w-full sm:w-auto sm:min-w-50">
											<SelectValue placeholder="Choose a class" />
										</SelectTrigger>

										<SelectContent>
											{classes.map(cls => (
												<SelectItem
													key={cls.id}
													value={cls.id}>
													{cls.name}
												</SelectItem>
											))}
										</SelectContent>
									</Select>

									<Button
										onClick={handleAddStudent}
										disabled={!selectedClass}
										className="w-full sm:w-auto">
										Add Student
									</Button>
								</div>
							</div>
						)}

						{user.student && !isEditingClass && (
							<p className="text-sm text-muted-foreground">
								Currently a student in{" "}
								<span className="font-medium">
									{classes.find(
										c => c.id === user.student?.classId
									)?.name ?? "Unknown Class"}
								</span>
							</p>
						)}

						{user.student && isEditingClass && (
							<div className="space-y-2">
								<Label htmlFor="edit-class-select">
									Change Class
								</Label>

								<div className="flex flex-wrap gap-2">
									<Select
										value={selectedClass}
										onValueChange={setSelectedClass}>
										<SelectTrigger
											id="edit-class-select"
											className="w-full sm:w-auto sm:min-w-50">
											<SelectValue placeholder="Choose a class" />
										</SelectTrigger>

										<SelectContent>
											{classes.map(cls => (
												<SelectItem
													key={cls.id}
													value={cls.id}>
													{cls.name}
												</SelectItem>
											))}
										</SelectContent>
									</Select>

									<Button
										onClick={handleUpdateStudent}
										disabled={
											!selectedClass ||
											selectedClass ===
												user.student?.classId
										}
										className="w-full sm:w-auto">
										Save
									</Button>
								</div>
							</div>
						)}
					</div>

					<Separator />

					{/* Teacher Role */}
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
											onClick={() =>
												setIsEditingSubjects(false)
											}>
											Cancel Edit
										</Button>
									) : (
										<Button
											variant="outline"
											size="sm"
											onClick={() => {
												setSelectedSubjects(
													user.teacher?.subjects?.map(
														subject => subject.id
													) ?? []
												);
												setIsEditingSubjects(true);
											}}>
											Edit Subjects
										</Button>
									)}

									<Button
										variant="destructive"
										size="sm"
										onClick={handleRemoveTeacher}>
										Remove Teacher
									</Button>
								</div>
							)}
						</div>

						{!user.teacher ? (
							user.student ? (
								<p className="text-sm text-muted-foreground">
									Cannot add teacher role - user is already a
									student.
								</p>
							) : (
								<div className="space-y-2">
									<MultiSelectCombobox
										items={subjects.map(subject => ({
											value: subject.id,
											label: subject.name,
										}))}
										selectedValues={selectedSubjects}
										onChange={setSelectedSubjects}
										label="Select Subjects"
										placeholder="Choose subjects"
										searchPlaceholder="Search subjects..."
										emptyMessage="No subjects found."
										maxShownItems={3}
									/>

									<Button
										onClick={handleAddTeacher}
										className="w-full">
										Add Teacher
									</Button>
								</div>
							)
						) : isEditingSubjects ? (
							<div className="space-y-2">
								<Label>Select Subjects</Label>

								<div className="flex flex-wrap gap-2">
									<div className="flex-1 min-w-50">
										<MultiSelectCombobox
											items={subjects.map(subject => ({
												value: subject.id,
												label: subject.name,
											}))}
											selectedValues={selectedSubjects}
											onChange={setSelectedSubjects}
											placeholder="Choose subjects"
											searchPlaceholder="Search subjects..."
											emptyMessage="No subjects found."
											maxShownItems={3}
										/>
									</div>

									<Button
										onClick={handleUpdateTeacher}
										className="w-full sm:w-auto">
										Save
									</Button>
								</div>
							</div>
						) : (
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
	// Default is 30 days
	const [ttlSeconds, setTtlSeconds] = useState<number>(2592000);

	if (!user) return null;

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

				<div className="grid gap-4 py-4">
					<div className="grid gap-2">
						<Label htmlFor="ttl">Invite Valid For (hours)</Label>
						<Input
							id="ttl"
							type="number"
							min="1"
							value={ttlSeconds / 3600}
							onChange={e =>
								setTtlSeconds(Number(e.target.value) * 3600)
							}
						/>
						<p className="text-xs text-muted-foreground">
							The invite will expire after this many hours.
						</p>
					</div>
				</div>

				<DialogFooter>
					<Button
						variant="outline"
						onClick={() => onOpenChange(false)}>
						Cancel
					</Button>
					<Button
						onClick={() => {
							onConfirm(user.id, ttlSeconds);
							onOpenChange(false);
						}}>
						Send Invite
					</Button>
				</DialogFooter>
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
	if (!user) return null;

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
							? `Are you sure you want to grant admin privileges to ${user.firstName} ${user.lastName}? They will have full access to school management.`
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
