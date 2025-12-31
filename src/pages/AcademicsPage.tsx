import { useState } from "react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { GraduationCap, BookOpen, Plus } from "lucide-react";

import { useSession } from "@/context/session-context";
import {
	getClassesControllerFindAllBySchoolQueryKey,
	useClassesControllerCreate,
	useClassesControllerFindAllBySchool,
	useClassesControllerRemove,
	useClassesControllerUpdate,
} from "@/api/generated/endpoints/classes/classes";
import {
	getSubjectsControllerFindAllBySchoolQueryKey,
	useSubjectsControllerCreate,
	useSubjectsControllerFindAllBySchool,
	useSubjectsControllerRemove,
	useSubjectsControllerUpdate,
} from "@/api/generated/endpoints/subjects/subjects";
import {
	useUsersControllerFindAllBySchool,
	getUsersControllerFindAllBySchoolQueryKey,
} from "@/api/generated/endpoints/users/users";
import {
	useStudentsControllerUpdate,
	useStudentsControllerRemove,
	useStudentsControllerCreate,
} from "@/api/generated/endpoints/students/students";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
	Empty,
	EmptyHeader,
	EmptyTitle,
	EmptyDescription,
	EmptyContent,
} from "@/components/ui/empty";
import { ClassCard } from "@/components/academics/class-card";
import { SubjectCard } from "@/components/academics/subject-card";
import {
	CreateClassDialog,
	DeleteClassDialog,
	EditClassDialog,
	AssignStudentsDialog,
} from "@/components/academics/class-dialogs";
import {
	CreateSubjectDialog,
	DeleteSubjectDialog,
	EditSubjectDialog,
	AssignTeachersDialog,
} from "@/components/academics/subject-dialogs";
import type { ClassEntity } from "@/api/generated/models/classEntity";
import type { SubjectEntity } from "@/api/generated/models/subjectEntity";
import type { CreateClassDto } from "@/api/generated/models/createClassDto";
import type { UpdateClassDto } from "@/api/generated/models/updateClassDto";
import type { CreateSubjectDto } from "@/api/generated/models/createSubjectDto";
import type { UpdateSubjectDto } from "@/api/generated/models/updateSubjectDto";

export default function AcademicsPage() {
	const { user: currentUser } = useSession();
	const queryClient = useQueryClient();
	const [activeTab, setActiveTab] = useState("classes");

	const [createClassDialogOpen, setCreateClassDialogOpen] = useState(false);
	const [editClassDialogOpen, setEditClassDialogOpen] = useState(false);
	const [deleteClassDialogOpen, setDeleteClassDialogOpen] = useState(false);
	const [assignStudentsDialogOpen, setAssignStudentsDialogOpen] =
		useState(false);
	const [selectedClass, setSelectedClass] = useState<ClassEntity | null>(
		null
	);

	const [createSubjectDialogOpen, setCreateSubjectDialogOpen] =
		useState(false);
	const [editSubjectDialogOpen, setEditSubjectDialogOpen] = useState(false);
	const [deleteSubjectDialogOpen, setDeleteSubjectDialogOpen] =
		useState(false);
	const [assignTeachersDialogOpen, setAssignTeachersDialogOpen] =
		useState(false);
	const [selectedSubject, setSelectedSubject] =
		useState<SubjectEntity | null>(null);

	const { data: classes = [] } = useClassesControllerFindAllBySchool(
		currentUser?.schoolId ?? "",
		{
			query: {
				enabled: !!currentUser?.schoolId,
			},
		}
	);

	const { data: subjects = [] } = useSubjectsControllerFindAllBySchool(
		currentUser?.schoolId ?? "",
		{
			query: {
				enabled: !!currentUser?.schoolId,
			},
		}
	);

	const { data: users = [] } = useUsersControllerFindAllBySchool(
		currentUser?.schoolId ?? "",
		{
			query: {
				enabled: !!currentUser?.schoolId,
			},
		}
	);

	const students = users
		.filter(user => !!user.student)
		.map(user => user.student!);

	// Class mutations
	const createClassMutation = useClassesControllerCreate({
		mutation: {
			onSuccess: () => {
				toast.success("Class created successfully");

				queryClient.invalidateQueries({
					queryKey: getClassesControllerFindAllBySchoolQueryKey(
						currentUser?.schoolId
					),
				});

				setCreateClassDialogOpen(false);
			},
		},
	});

	const updateClassMutation = useClassesControllerUpdate({
		mutation: {
			onSuccess: () => {
				toast.success("Class updated successfully");

				queryClient.invalidateQueries({
					queryKey: getClassesControllerFindAllBySchoolQueryKey(
						currentUser?.schoolId
					),
				});

				setEditClassDialogOpen(false);
				setSelectedClass(null);
			},
		},
	});

	const deleteClassMutation = useClassesControllerRemove({
		mutation: {
			onSuccess: () => {
				toast.success("Class deleted successfully");

				queryClient.invalidateQueries({
					queryKey: getClassesControllerFindAllBySchoolQueryKey(
						currentUser?.schoolId
					),
				});

				setDeleteClassDialogOpen(false);
				setSelectedClass(null);
			},
		},
	});

	// Subject mutations
	const createSubjectMutation = useSubjectsControllerCreate({
		mutation: {
			onSuccess: () => {
				toast.success("Subject created successfully");

				queryClient.invalidateQueries({
					queryKey: getSubjectsControllerFindAllBySchoolQueryKey(
						currentUser?.schoolId
					),
				});

				setCreateSubjectDialogOpen(false);
			},
		},
	});

	const updateSubjectMutation = useSubjectsControllerUpdate({
		mutation: {
			onSuccess: () => {
				toast.success("Subject updated successfully");

				queryClient.invalidateQueries({
					queryKey: getSubjectsControllerFindAllBySchoolQueryKey(
						currentUser?.schoolId
					),
				});

				setEditSubjectDialogOpen(false);
				setSelectedSubject(null);
			},
		},
	});

	const deleteSubjectMutation = useSubjectsControllerRemove({
		mutation: {
			onSuccess: () => {
				toast.success("Subject deleted successfully");

				queryClient.invalidateQueries({
					queryKey: getSubjectsControllerFindAllBySchoolQueryKey(
						currentUser?.schoolId
					),
				});

				setDeleteSubjectDialogOpen(false);
				setSelectedSubject(null);
			},
		},
	});

	const updateStudentMutation = useStudentsControllerUpdate({
		mutation: {
			onSuccess: () => {
				queryClient.invalidateQueries({
					queryKey: getClassesControllerFindAllBySchoolQueryKey(
						currentUser?.schoolId
					),
				});

				queryClient.invalidateQueries({
					queryKey: getUsersControllerFindAllBySchoolQueryKey(
						currentUser?.schoolId
					),
				});
			},
		},
	});

	const removeStudentMutation = useStudentsControllerRemove({
		mutation: {
			onSuccess: () => {
				queryClient.invalidateQueries({
					queryKey: getClassesControllerFindAllBySchoolQueryKey(
						currentUser?.schoolId
					),
				});

				queryClient.invalidateQueries({
					queryKey: getUsersControllerFindAllBySchoolQueryKey(
						currentUser?.schoolId
					),
				});
			},
		},
	});

	const createStudentMutation = useStudentsControllerCreate({
		mutation: {
			onSuccess: () => {
				queryClient.invalidateQueries({
					queryKey: getClassesControllerFindAllBySchoolQueryKey(
						currentUser?.schoolId
					),
				});

				queryClient.invalidateQueries({
					queryKey: getUsersControllerFindAllBySchoolQueryKey(
						currentUser?.schoolId
					),
				});
			},
		},
	});

	const handleCreateClass = (data: CreateClassDto) => {
		createClassMutation.mutate({ data });
	};

	const handleEditClass = (data: UpdateClassDto) => {
		if (selectedClass) {
			updateClassMutation.mutate({ id: selectedClass.id, data });
		}
	};

	const handleDeleteClass = () => {
		if (selectedClass) {
			deleteClassMutation.mutate({ id: selectedClass.id });
		}
	};

	const handleAssignStudents = (userIds: string[]) => {
		if (!selectedClass) {
			return;
		}

		// Find students currently in this class
		const currentStudents = students.filter(
			student => student.classId === selectedClass.id
		);

		const currentUserIds = currentStudents.map(student => student.userId);

		// Find users to add (in new selection but not in current)
		const usersToAdd = userIds.filter(id => !currentUserIds.includes(id));

		// Find students to remove (in current but not in new selection)
		const studentsToRemove = currentStudents.filter(
			student => !userIds.includes(student.userId)
		);

		const promises: Promise<unknown>[] = [];

		// Create student entries for users being added
		usersToAdd.forEach(userId => {
			promises.push(
				createStudentMutation.mutateAsync({
					data: { userId, classId: selectedClass.id },
				})
			);
		});

		// Remove students
		studentsToRemove.forEach(student => {
			promises.push(
				removeStudentMutation.mutateAsync({ id: student.id })
			);
		});

		Promise.all(promises)
			.then(() => {
				toast.success("Students assigned successfully");

				setAssignStudentsDialogOpen(false);
				setSelectedClass(null);
			})
			.catch(() => {
				toast.error("Failed to assign some students");
			});
	};

	const handleCreateSubject = (data: CreateSubjectDto) => {
		createSubjectMutation.mutate({ data });
	};

	const handleEditSubject = (data: UpdateSubjectDto) => {
		if (selectedSubject) {
			updateSubjectMutation.mutate({ id: selectedSubject.id, data });
		}
	};

	const handleDeleteSubject = () => {
		if (selectedSubject) {
			deleteSubjectMutation.mutate({ id: selectedSubject.id });
		}
	};

	const handleAssignTeachers = (teacherIds: string[]) => {
		if (!selectedSubject) {
			return;
		}

		updateSubjectMutation.mutate({
			id: selectedSubject.id,
			data: {
				name: selectedSubject.name,
				schoolId: selectedSubject.schoolId,
				teacherIds,
			},
		});

		setAssignTeachersDialogOpen(false);
		setSelectedSubject(null);
	};

	return (
		<div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 space-y-6">
			<div>
				<h1 className="text-3xl font-bold tracking-tight">Academics</h1>
				<p className="text-muted-foreground">
					Manage classes, subjects, and their assignments
				</p>
			</div>

			<Tabs
				value={activeTab}
				onValueChange={setActiveTab}
				className="w-full">
				<div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 mb-6">
					<TabsList className="grid w-full lg:w-auto lg:min-w-100 grid-cols-2 h-12">
						<TabsTrigger
							value="classes"
							className="gap-2 h-full data-[state=active]:bg-chart-4! data-[state=active]:text-white dark:data-[state=active]:text-white">
							<GraduationCap className="h-4 w-4" />
							Classes
						</TabsTrigger>

						<TabsTrigger
							value="subjects"
							className="gap-2 h-full data-[state=active]:bg-chart-3! data-[state=active]:text-white dark:data-[state=active]:text-white">
							<BookOpen className="h-4 w-4" />
							Subjects
						</TabsTrigger>
					</TabsList>

					<Button
						onClick={() => {
							if (activeTab === "classes") {
								setCreateClassDialogOpen(true);
							} else {
								setCreateSubjectDialogOpen(true);
							}
						}}
						className={`gap-2 ${
							activeTab === "classes"
								? "bg-chart-4 hover:bg-chart-4/90"
								: "bg-chart-3 hover:bg-chart-3/90"
						}`}>
						<Plus className="h-4 w-4" />
						Create {activeTab === "classes" ? "Class" : "Subject"}
					</Button>
				</div>

				<TabsContent value="classes" className="space-y-4">
					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
						{classes.map(cls => (
							<ClassCard
								key={cls.id}
								classEntity={cls}
								students={students}
								users={users}
								onEdit={() => {
									setSelectedClass(cls);
									setEditClassDialogOpen(true);
								}}
								onDelete={() => {
									setSelectedClass(cls);
									setDeleteClassDialogOpen(true);
								}}
								onAssign={() => {
									setSelectedClass(cls);
									setAssignStudentsDialogOpen(true);
								}}
							/>
						))}

						{classes.length === 0 && (
							<Empty className="col-span-full">
								<EmptyHeader>
									<EmptyTitle>No classes yet</EmptyTitle>

									<EmptyDescription>
										Create your first class to get started
									</EmptyDescription>
								</EmptyHeader>

								<EmptyContent>
									<Button
										onClick={() =>
											setCreateClassDialogOpen(true)
										}
										className="gap-2 bg-chart-4 hover:bg-chart-4/90">
										<Plus className="h-4 w-4" />
										Create Class
									</Button>
								</EmptyContent>
							</Empty>
						)}
					</div>
				</TabsContent>

				<TabsContent value="subjects" className="space-y-4">
					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
						{subjects.map(subject => (
							<SubjectCard
								key={subject.id}
								subject={subject}
								users={users}
								onEdit={() => {
									setSelectedSubject(subject);
									setEditSubjectDialogOpen(true);
								}}
								onDelete={() => {
									setSelectedSubject(subject);
									setDeleteSubjectDialogOpen(true);
								}}
								onAssign={() => {
									setSelectedSubject(subject);
									setAssignTeachersDialogOpen(true);
								}}
							/>
						))}

						{subjects.length === 0 && (
							<Empty className="col-span-full">
								<EmptyHeader>
									<EmptyTitle>No subjects yet</EmptyTitle>

									<EmptyDescription>
										Create your first subject to get started
									</EmptyDescription>
								</EmptyHeader>

								<EmptyContent>
									<Button
										onClick={() =>
											setCreateSubjectDialogOpen(true)
										}
										className="gap-2 bg-chart-3 hover:bg-chart-3/90">
										<Plus className="h-4 w-4" />
										Create Subject
									</Button>
								</EmptyContent>
							</Empty>
						)}
					</div>
				</TabsContent>
			</Tabs>

			<CreateClassDialog
				open={createClassDialogOpen}
				onOpenChange={setCreateClassDialogOpen}
				onSubmit={handleCreateClass}
				schoolId={currentUser?.schoolId ?? ""}
				isLoading={createClassMutation.isPending}
			/>

			<EditClassDialog
				open={editClassDialogOpen}
				onOpenChange={setEditClassDialogOpen}
				onSubmit={handleEditClass}
				classData={selectedClass}
				isLoading={updateClassMutation.isPending}
			/>

			<DeleteClassDialog
				open={deleteClassDialogOpen}
				onOpenChange={setDeleteClassDialogOpen}
				onConfirm={handleDeleteClass}
				classData={selectedClass}
				isLoading={deleteClassMutation.isPending}
			/>

			<AssignStudentsDialog
				open={assignStudentsDialogOpen}
				onOpenChange={setAssignStudentsDialogOpen}
				onSubmit={handleAssignStudents}
				classData={selectedClass}
				students={students}
				users={users}
				isLoading={updateStudentMutation.isPending}
			/>

			<CreateSubjectDialog
				open={createSubjectDialogOpen}
				onOpenChange={setCreateSubjectDialogOpen}
				onSubmit={handleCreateSubject}
				schoolId={currentUser?.schoolId ?? ""}
				isLoading={createSubjectMutation.isPending}
			/>

			<EditSubjectDialog
				open={editSubjectDialogOpen}
				onOpenChange={setEditSubjectDialogOpen}
				onSubmit={handleEditSubject}
				subjectData={selectedSubject}
				isLoading={updateSubjectMutation.isPending}
			/>

			<DeleteSubjectDialog
				open={deleteSubjectDialogOpen}
				onOpenChange={setDeleteSubjectDialogOpen}
				onConfirm={handleDeleteSubject}
				subjectData={selectedSubject}
				isLoading={deleteSubjectMutation.isPending}
			/>

			<AssignTeachersDialog
				open={assignTeachersDialogOpen}
				onOpenChange={setAssignTeachersDialogOpen}
				onSubmit={handleAssignTeachers}
				subjectData={selectedSubject}
				users={users}
				isLoading={updateSubjectMutation.isPending}
			/>
		</div>
	);
}
