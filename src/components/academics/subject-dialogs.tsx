import { useEffect, useEffectEvent, useState } from "react";

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
import type { SubjectEntity } from "@/api/generated/models/subjectEntity";
import type { CreateSubjectDto } from "@/api/generated/models/createSubjectDto";
import type { UpdateSubjectDto } from "@/api/generated/models/updateSubjectDto";
import type { UserEntity } from "@/api/generated/models/userEntity";

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
	const [name, setName] = useState("");

	const resetForm = useEffectEvent(() => {
		setName("");
	});

	useEffect(() => {
		if (!open) {
			resetForm();
		}
	}, [open]);

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();

		onSubmit({ name, schoolId });
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Create New Subject</DialogTitle>

					<DialogDescription>
						Add a new subject to your school
					</DialogDescription>
				</DialogHeader>

				<form onSubmit={handleSubmit}>
					<div className="space-y-4">
						<div className="space-y-2">
							<Label htmlFor="name">Subject Name</Label>
							<Input
								id="name"
								value={name}
								onChange={e => setName(e.target.value)}
								placeholder="e.g., Mathematics, History"
								className="focus-visible:border-chart-3 focus-visible:ring-chart-3/50"
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
	const [name, setName] = useState("");

	const syncFormData = useEffectEvent(() => {
		if (subjectData) {
			setName(subjectData.name);
		}
	});

	useEffect(() => {
		if (open) {
			syncFormData();
		}
	}, [subjectData, open]);

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();

		onSubmit({ name });
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Edit Subject</DialogTitle>

					<DialogDescription>
						Update the subject information
					</DialogDescription>
				</DialogHeader>

				<form onSubmit={handleSubmit}>
					<div className="space-y-4">
						<div className="space-y-2">
							<Label htmlFor="name">Subject Name</Label>
							<Input
								id="name"
								value={name}
								onChange={e => setName(e.target.value)}
								placeholder="e.g., Mathematics, History"
								className="focus-visible:border-chart-3 focus-visible:ring-chart-3/50"
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
							className="bg-chart-3 hover:bg-chart-3/90">
							{isLoading ? "Saving..." : "Save"}
						</Button>
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
	onSubmit: (teacherIds: string[]) => void;
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
	const [selectedTeachers, setSelectedTeachers] = useState<string[]>([]);

	const syncSelectedTeachers = useEffectEvent(() => {
		if (subjectData) {
			const currentTeachers =
				subjectData.teachers?.map(teacher => teacher.id) ?? [];

			setSelectedTeachers(currentTeachers);
		}
	});

	useEffect(() => {
		if (open) {
			syncSelectedTeachers();
		}
	}, [subjectData, open]);

	const handleSubmit = () => {
		onSubmit(selectedTeachers);
	};

	// Get users who have a teacher record
	const teacherUsers = users.filter(user => user.teacher);

	// Create options for combobox
	const teacherOptions = teacherUsers
		.filter(user => user.teacher)
		.map(user => ({
			value: user.teacher!.id,
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

				<div className="py-4">
					<MultiSelectCombobox
						items={teacherOptions}
						selectedValues={selectedTeachers}
						onChange={setSelectedTeachers}
						placeholder="Select teachers..."
						searchPlaceholder="Search teachers..."
						emptyMessage="No teachers found."
						label="Teachers"
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
						className="bg-chart-3 hover:bg-chart-3/90">
						{isLoading ? "Assigning..." : "Assign Teachers"}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
