import { useState } from "react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { GraduationCap, BookOpen, Plus } from "lucide-react";

import { useSchool } from "@/context/school-context";
import { SchoolRequired } from "@/components/common/school-required";
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
import { useTeachersControllerCreate } from "@/api/generated/endpoints/teachers/teachers";

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
	const { schoolId } = useSchool();
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
		schoolId!,
		{
			query: {
				enabled: !!schoolId,
				meta: {
					operationContext: "get all classes",
				},
			},
		}
	);

	const { data: subjects = [] } = useSubjectsControllerFindAllBySchool(
		schoolId!,
		{
			query: {
				enabled: !!schoolId,
				meta: {
					operationContext: "get all subjects",
				},
			},
		}
	);

	const { data: users = [] } = useUsersControllerFindAllBySchool(schoolId!, {
		query: {
			enabled: !!schoolId,
			meta: {
				operationContext: "get all users",
			},
		},
	});

	const students = users
		.filter(user => !!user.student)
		.map(user => user.student!);

	// Class mutations
	const createClassMutation = useClassesControllerCreate({
		mutation: {
			meta: {
				operationContext: "create class",
			},
			onSuccess: () => {
				toast.success("Class created successfully");

				queryClient.invalidateQueries({
					queryKey: getClassesControllerFindAllBySchoolQueryKey(
						schoolId!
					),
				});

				setCreateClassDialogOpen(false);
			},
		},
	});

	const updateClassMutation = useClassesControllerUpdate({
		mutation: {
			meta: {
				operationContext: "update class",
			},
			onSuccess: () => {
				toast.success("Class updated successfully");

				queryClient.invalidateQueries({
					queryKey: getClassesControllerFindAllBySchoolQueryKey(
						schoolId!
					),
				});

				setEditClassDialogOpen(false);
				setSelectedClass(null);
			},
		},
	});

	const deleteClassMutation = useClassesControllerRemove({
		mutation: {
			meta: {
				operationContext: "delete class",
			},
			onSuccess: () => {
				toast.success("Class deleted successfully");

				queryClient.invalidateQueries({
					queryKey: getClassesControllerFindAllBySchoolQueryKey(
						schoolId!
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
			meta: {
				operationContext: "create subject",
			},
			onSuccess: () => {
				toast.success("Subject created successfully");

				queryClient.invalidateQueries({
					queryKey: getSubjectsControllerFindAllBySchoolQueryKey(
						schoolId!
					),
				});

				setCreateSubjectDialogOpen(false);
			},
		},
	});

	const updateSubjectMutation = useSubjectsControllerUpdate({
		mutation: {
			meta: {
				operationContext: "update subject",
			},
			onSuccess: () => {
				toast.success("Subject updated successfully");

				queryClient.invalidateQueries({
					queryKey: getSubjectsControllerFindAllBySchoolQueryKey(
						schoolId!
					),
				});

				setEditSubjectDialogOpen(false);
				setSelectedSubject(null);
			},
		},
	});

	const createTeacherMutation = useTeachersControllerCreate({
		mutation: {
			meta: {
				operationContext: "create teacher",
			},
			onSuccess: () => {
				queryClient.invalidateQueries({
					queryKey: getUsersControllerFindAllBySchoolQueryKey(
						schoolId!
					),
				});
			},
		},
	});

	const deleteSubjectMutation = useSubjectsControllerRemove({
		mutation: {
			meta: {
				operationContext: "delete subject",
			},
			onSuccess: () => {
				toast.success("Subject deleted successfully");

				queryClient.invalidateQueries({
					queryKey: getSubjectsControllerFindAllBySchoolQueryKey(
						schoolId!
					),
				});

				setDeleteSubjectDialogOpen(false);
				setSelectedSubject(null);
			},
		},
	});

	// Student mutations
	const createStudentMutation = useStudentsControllerCreate({
		mutation: {
			meta: {
				operationContext: "create student",
			},
			onSuccess: () => {
				queryClient.invalidateQueries({
					queryKey: getClassesControllerFindAllBySchoolQueryKey(
						schoolId!
					),
				});

				queryClient.invalidateQueries({
					queryKey: getUsersControllerFindAllBySchoolQueryKey(
						schoolId!
					),
				});
			},
		},
	});

	const updateStudentMutation = useStudentsControllerUpdate({
		mutation: {
			meta: {
				operationContext: "update student",
			},
			onSuccess: () => {
				queryClient.invalidateQueries({
					queryKey: getClassesControllerFindAllBySchoolQueryKey(
						schoolId!
					),
				});

				queryClient.invalidateQueries({
					queryKey: getUsersControllerFindAllBySchoolQueryKey(
						schoolId!
					),
				});
			},
		},
	});

	const removeStudentMutation = useStudentsControllerRemove({
		mutation: {
			meta: {
				operationContext: "remove student",
			},
			onSuccess: () => {
				queryClient.invalidateQueries({
					queryKey: getClassesControllerFindAllBySchoolQueryKey(
						schoolId!
					),
				});

				queryClient.invalidateQueries({
					queryKey: getUsersControllerFindAllBySchoolQueryKey(
						schoolId!
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

	const handleAssignTeachers = async (userIds: string[]) => {
		if (!selectedSubject) {
			return;
		}

		try {
			const resolvedTeacherIds = await Promise.all(
				userIds.map(async userId => {
					const user = users.find(user => user.id === userId);

					if (!user) {
						return null;
					}

					if (user.teacher) {
						return user.teacher.id;
					}

					const newTeacher = await createTeacherMutation.mutateAsync({
						data: { userId },
					});

					return newTeacher.id;
				})
			);

			const validTeacherIds = resolvedTeacherIds.filter(
				(id): id is string => id !== null
			);

			updateSubjectMutation.mutate({
				id: selectedSubject.id,
				data: {
					name: selectedSubject.name,
					schoolId: selectedSubject.schoolId,
					teacherIds: validTeacherIds,
				},
			});

			setAssignTeachersDialogOpen(false);
			setSelectedSubject(null);
		} catch (error) {
			console.error(error);

			toast.error("Failed to assign teachers");
		}
	};

	return (
		<SchoolRequired>
			<div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 space-y-6">
				<div>
					<h1 className="text-3xl font-bold tracking-tight">
						Academics
					</h1>
					<p className="text-muted-foreground">
						Manage classes, subjects, and their assignments
					</p>
				</div>

				<Tabs
					value={activeTab}
					onValueChange={setActiveTab}
					className="w-full">
					<div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 mb-6">
						<TabsList className="relative grid w-full lg:w-auto lg:min-w-100 grid-cols-2 h-12">
							<div
								className={`absolute inset-y-1 rounded-md transition-all duration-300 ease-out ${
									activeTab === "classes"
										? "left-1 right-1/2 mr-1 bg-chart-4"
										: "left-1/2 right-1 ml-1 bg-chart-3"
								}`}
							/>
							<TabsTrigger
								value="classes"
								className="cursor-pointer hover:brightness-130 border-none relative z-10 gap-2 h-full transition-all data-[state=active]:text-white dark:data-[state=active]:text-white">
								<GraduationCap className="h-4 w-4" />
								Classes
							</TabsTrigger>

							<TabsTrigger
								value="subjects"
								className="cursor-pointer hover:brightness-130 border-none relative z-10 gap-2 h-full transition-all data-[state=active]:text-white dark:data-[state=active]:text-white">
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
							Create{" "}
							{activeTab === "classes" ? "Class" : "Subject"}
						</Button>
					</div>

					<TabsContent value="classes" className="space-y-4">
						<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
							{classes.map(currentClass => (
								<ClassCard
									key={currentClass.id}
									classEntity={currentClass}
									students={students}
									users={users}
									onEdit={() => {
										setSelectedClass(currentClass);
										setEditClassDialogOpen(true);
									}}
									onDelete={() => {
										setSelectedClass(currentClass);
										setDeleteClassDialogOpen(true);
									}}
									onAssign={() => {
										setSelectedClass(currentClass);
										setAssignStudentsDialogOpen(true);
									}}
								/>
							))}

							{classes.length === 0 && (
								<Empty className="col-span-full">
									<EmptyHeader>
										<EmptyTitle>No classes yet</EmptyTitle>

										<EmptyDescription>
											Create your first class to get
											started
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
											Create your first subject to get
											started
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
					schoolId={schoolId!}
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
					schoolId={schoolId!}
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
					isLoading={
						updateSubjectMutation.isPending ||
						createTeacherMutation.isPending
					}
				/>
			</div>
		</SchoolRequired>
	);
}
