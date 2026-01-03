import { useEffect, useEffectEvent, useState, type FormEvent } from "react";

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
import { MultiSelectCombobox } from "@/components/ui/multi-select-combobox";
import type { ClassEntity } from "@/api/generated/models/classEntity";
import type { CreateClassDto } from "@/api/generated/models/createClassDto";
import type { UpdateClassDto } from "@/api/generated/models/updateClassDto";
import type { StudentEntity } from "@/api/generated/models/studentEntity";
import type { UserEntity } from "@/api/generated/models/userEntity";

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
	const [name, setName] = useState("");

	const resetForm = useEffectEvent(() => {
		setName("");
	});

	useEffect(() => {
		if (!open) {
			resetForm();
		}
	}, [open]);

	const handleSubmit = (e: FormEvent) => {
		e.preventDefault();
		onSubmit({ name, schoolId });
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Create New Class</DialogTitle>

					<DialogDescription>
						Add a new class to your school
					</DialogDescription>
				</DialogHeader>

				<form onSubmit={handleSubmit}>
					<div className="space-y-4">
						<div className="space-y-2">
							<Label htmlFor="name">Class Name</Label>
							<Input
								id="name"
								value={name}
								onChange={e => setName(e.target.value)}
								placeholder="e.g., 10A, Grade 5B"
								className="focus-visible:border-chart-4 focus-visible:ring-chart-4/50"
								required
							/>
						</div>
					</div>

					<DialogFooter className="mt-6">
						<Button
							type="button"
							variant="outline"
							onClick={() => onOpenChange(false)}
							disabled={isLoading}>
							Cancel
						</Button>

						<Button type="submit" disabled={isLoading}>
							{isLoading ? "Creating..." : "Create"}
						</Button>
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
	const [name, setName] = useState("");

	const syncFormData = useEffectEvent(() => {
		if (classData) {
			setName(classData.name);
		}
	});

	useEffect(() => {
		if (open) {
			syncFormData();
		}
	}, [classData, open]);

	const handleSubmit = (e: FormEvent) => {
		e.preventDefault();

		onSubmit({ name });
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Edit Class</DialogTitle>

					<DialogDescription>
						Update the class information
					</DialogDescription>
				</DialogHeader>

				<form onSubmit={handleSubmit}>
					<div className="space-y-4">
						<div className="space-y-2">
							<Label htmlFor="name">Class Name</Label>
							<Input
								id="name"
								value={name}
								onChange={e => setName(e.target.value)}
								placeholder="e.g., 10A, Grade 5B"
								className="focus-visible:border-chart-4 focus-visible:ring-chart-4/50"
								required
							/>
						</div>
					</div>

					<DialogFooter className="mt-6">
						<Button
							type="button"
							variant="outline"
							onClick={() => onOpenChange(false)}
							disabled={isLoading}>
							Cancel
						</Button>

						<Button
							type="submit"
							disabled={isLoading}
							className="bg-chart-4 hover:bg-chart-4/90">
							{isLoading ? "Saving..." : "Save"}
						</Button>
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
	const [selectedUsers, setSelectedUsers] = useState<string[]>([]);

	const syncSelectedUsers = useEffectEvent(() => {
		if (classData) {
			const currentUserIds = students
				.filter(student => student.classId === classData.id)
				.map(student => student.userId);

			setSelectedUsers(currentUserIds);
		}
	});

	useEffect(() => {
		if (open) {
			syncSelectedUsers();
		}
	}, [classData, open]);

	const handleSubmit = () => {
		onSubmit(selectedUsers);
	};

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

				<div className="py-4">
					<MultiSelectCombobox
						items={userOptions}
						selectedValues={selectedUsers}
						onChange={setSelectedUsers}
						placeholder="Select students..."
						searchPlaceholder="Search students..."
						emptyMessage="No students found."
						label="Students"
					/>
				</div>

				<DialogFooter>
					<Button
						variant="outline"
						onClick={() => onOpenChange(false)}
						disabled={isLoading}>
						Cancel
					</Button>

					<Button
						onClick={handleSubmit}
						disabled={isLoading}
						className="bg-chart-4 hover:bg-chart-4/90">
						{isLoading ? "Assigning..." : "Assign Students"}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
