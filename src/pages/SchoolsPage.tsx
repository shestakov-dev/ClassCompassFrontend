import { useState, useMemo } from "react";
import { Search, Plus, School } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import {
	useSchoolsControllerFindAll,
	useSchoolsControllerCreate,
	useSchoolsControllerUpdate,
	useSchoolsControllerRemove,
} from "@/api/generated/endpoints/schools/schools";
import type { SchoolEntity } from "@/api/generated/models";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { getSchoolsControllerFindAllQueryKey } from "@/api/generated/endpoints/schools/schools";
import { SchoolCard } from "@/components/schools/school-card";
import {
	CreateSchoolDialog,
	EditSchoolDialog,
	DeleteSchoolDialog,
} from "@/components/schools/school-dialogs";
import type { CreateSchoolDto } from "@/api/generated/models/createSchoolDto";
import type { UpdateSchoolDto } from "@/api/generated/models/updateSchoolDto";

export default function SchoolsPage() {
	const [searchQuery, setSearchQuery] = useState("");
	const [isCreateOpen, setIsCreateOpen] = useState(false);
	const [isEditOpen, setIsEditOpen] = useState(false);
	const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
	const [editingSchool, setEditingSchool] = useState<SchoolEntity | null>(
		null
	);
	const [schoolToDelete, setSchoolToDelete] = useState<SchoolEntity | null>(
		null
	);

	const queryClient = useQueryClient();

	const { data: schools = [], isLoading } = useSchoolsControllerFindAll({
		query: {
			meta: {
				operationContext: "get all schools",
			},
		},
	});

	const createMutation = useSchoolsControllerCreate({
		mutation: {
			meta: {
				operationContext: "create school",
			},
			onSuccess: () => {
				toast.success("School created successfully");

				queryClient.invalidateQueries({
					queryKey: getSchoolsControllerFindAllQueryKey(),
				});

				setIsCreateOpen(false);
			},
		},
	});

	const updateMutation = useSchoolsControllerUpdate({
		mutation: {
			meta: {
				operationContext: "update school",
			},
			onSuccess: () => {
				toast.success("School updated successfully");

				queryClient.invalidateQueries({
					queryKey: getSchoolsControllerFindAllQueryKey(),
				});

				setIsEditOpen(false);
				setEditingSchool(null);
			},
		},
	});

	const deleteMutation = useSchoolsControllerRemove({
		mutation: {
			meta: {
				operationContext: "delete school",
			},
			onSuccess: () => {
				toast.success("School deleted successfully");

				queryClient.invalidateQueries({
					queryKey: getSchoolsControllerFindAllQueryKey(),
				});

				setIsDeleteDialogOpen(false);
				setSchoolToDelete(null);
			},
		},
	});

	const handleOpenCreate = () => {
		setIsCreateOpen(true);
	};

	const handleOpenEdit = (school: SchoolEntity) => {
		setEditingSchool(school);
		setIsEditOpen(true);
	};

	const handleDeleteClick = (school: SchoolEntity) => {
		setSchoolToDelete(school);
		setIsDeleteDialogOpen(true);
	};

	const handleConfirmDelete = () => {
		if (schoolToDelete) {
			deleteMutation.mutate({ id: schoolToDelete.id });
		}
	};

	const handleCreateSubmit = (data: CreateSchoolDto) => {
		createMutation.mutate({ data });
	};

	const handleEditSubmit = (data: UpdateSchoolDto) => {
		if (editingSchool) {
			updateMutation.mutate({
				id: editingSchool.id,
				data,
			});
		}
	};

	const filteredSchools = useMemo(() => {
		return schools.filter(
			school =>
				school.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
				school.id.toLowerCase().includes(searchQuery.toLowerCase())
		);
	}, [schools, searchQuery]);

	return (
		<div className="flex flex-col h-full bg-background text-foreground font-sans overflow-hidden">
			{/* Header */}
			<div className="flex-none px-4 sm:px-6 py-6 flex flex-col gap-4">
				<div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
					<div>
						<h1 className="text-2xl font-bold tracking-tight">
							School Management
						</h1>
						<p className="text-muted-foreground text-sm">
							Manage educational institutions in the system
						</p>
					</div>
				</div>

				<div className="flex flex-col sm:flex-row items-center justify-between gap-4">
					<div className="relative w-full sm:w-80">
						<Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
						<Input
							placeholder="Search schools..."
							className="pl-9 bg-card"
							value={searchQuery}
							onChange={e => setSearchQuery(e.target.value)}
						/>
					</div>

					<Button
						onClick={handleOpenCreate}
						className="gap-2 shadow-sm w-full sm:w-auto">
						<Plus className="w-4 h-4" />
						Create School
					</Button>
				</div>
			</div>

			{/* Content */}
			<div className="flex-1 overflow-y-auto px-4 sm:px-6 pb-6">
				{isLoading ? (
					<div className="flex items-center justify-center h-full">
						<Spinner className="h-8 w-8 text-primary" />
					</div>
				) : filteredSchools.length === 0 ? (
					<div className="h-full flex flex-col items-center justify-center text-muted-foreground opacity-60">
						<School className="w-16 h-16 mb-4 stroke-1" />
						<p className="text-lg font-medium">No schools found.</p>

						<p className="text-sm">
							{searchQuery
								? "Try adjusting your search."
								: "Create a school to get started."}
						</p>
					</div>
				) : (
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
						{filteredSchools.map(school => (
							<SchoolCard
								key={school.id}
								school={school}
								onEdit={handleOpenEdit}
								onDelete={handleDeleteClick}
							/>
						))}
					</div>
				)}
			</div>

			<CreateSchoolDialog
				open={isCreateOpen}
				onOpenChange={setIsCreateOpen}
				onSubmit={handleCreateSubmit}
				isLoading={createMutation.isPending}
			/>

			<EditSchoolDialog
				open={isEditOpen}
				onOpenChange={setIsEditOpen}
				onSubmit={handleEditSubmit}
				school={editingSchool}
				isLoading={updateMutation.isPending}
			/>

			<DeleteSchoolDialog
				open={isDeleteDialogOpen}
				onOpenChange={setIsDeleteDialogOpen}
				onConfirm={handleConfirmDelete}
				isLoading={deleteMutation.isPending}
				school={schoolToDelete}
			/>
		</div>
	);
}
