import { useMemo, useState } from "react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

import { useSession } from "@/context/session-context";
import { useSchool } from "@/context/school-context";
import { SchoolRequired } from "@/components/common/school-required";
import {
	getUsersControllerFindAllBySchoolQueryKey,
	useUsersControllerCreate,
	useUsersControllerFindAllBySchool,
	useUsersControllerRemove,
	useUsersControllerUpdate,
} from "@/api/generated/endpoints/users/users";
import { useClassesControllerFindAllBySchool } from "@/api/generated/endpoints/classes/classes";
import { useSubjectsControllerFindAllBySchool } from "@/api/generated/endpoints/subjects/subjects";
import {
	getSchoolsControllerGetAdminsQueryKey,
	useSchoolsControllerDemoteFromAdmin,
	useSchoolsControllerGetAdmins,
	useSchoolsControllerPromoteToAdmin,
} from "@/api/generated/endpoints/schools/schools";
import { useInvitesControllerCreateInvite } from "@/api/generated/endpoints/invites/invites";
import {
	useStudentsControllerCreate,
	useStudentsControllerRemove,
	useStudentsControllerUpdate,
} from "@/api/generated/endpoints/students/students";
import {
	useTeachersControllerCreate,
	useTeachersControllerRemove,
	useTeachersControllerUpdate,
} from "@/api/generated/endpoints/teachers/teachers";

import { UsersDataTable } from "@/components/users/users-data-table";
import {
	createUserColumns,
	type UserWithRoles,
} from "@/components/users/user-columns";
import {
	CreateUserDialog,
	DeleteUserDialog,
	EditUserDialog,
	InviteUserDialog,
	ManageRolesDialog,
	ToggleAdminDialog,
} from "@/components/users/user-dialogs";
import type { CreateUserDto } from "@/api/generated/models/createUserDto";
import type { UpdateUserDto } from "@/api/generated/models/updateUserDto";

export default function UsersPage() {
	const { user: currentUser } = useSession();
	const { schoolId } = useSchool();
	const queryClient = useQueryClient();

	const [createDialogOpen, setCreateDialogOpen] = useState(false);
	const [editDialogOpen, setEditDialogOpen] = useState(false);
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
	const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
	const [manageRolesDialogOpen, setManageRolesDialogOpen] = useState(false);
	const [toggleAdminDialogOpen, setToggleAdminDialogOpen] = useState(false);
	const [selectedUser, setSelectedUser] = useState<UserWithRoles | null>(
		null
	);
	const [isBulkInvite, setIsBulkInvite] = useState(false);
	const [bulkInviteUsers, setBulkInviteUsers] = useState<UserWithRoles[]>([]);

	const { data: users = [] } = useUsersControllerFindAllBySchool(schoolId!, {
		query: {
			meta: {
				operationContext: "get all users",
			},
			enabled: !!schoolId,
		},
	});

	const { data: adminUsers = [] } = useSchoolsControllerGetAdmins(schoolId!, {
		query: {
			meta: {
				operationContext: "get admin users",
			},
			enabled: !!schoolId,
		},
	});

	const { data: classes = [] } = useClassesControllerFindAllBySchool(
		schoolId!,
		{
			query: {
				meta: {
					operationContext: "get all classes",
				},
				enabled: !!schoolId,
			},
		}
	);

	const { data: subjects = [] } = useSubjectsControllerFindAllBySchool(
		schoolId!,
		{
			query: {
				meta: {
					operationContext: "get all subjects",
				},
				enabled: !!schoolId,
			},
		}
	);

	// Add isAdmin property to users based on adminUsers list
	const usersWithAdminStatus = useMemo(() => {
		const adminIds = new Set(adminUsers.map(admin => admin.id));

		return users.map(user => ({
			...user,
			isAdmin: adminIds.has(user.id),
		}));
	}, [users, adminUsers]);

	const updateSelectedUserFromCache = () => {
		if (!selectedUser) return;

		const updatedUsers = queryClient.getQueryData<typeof users>(
			getUsersControllerFindAllBySchoolQueryKey(schoolId!)
		);

		const updatedUser = updatedUsers?.find(
			user => user.id === selectedUser.id
		);

		if (updatedUser) {
			const adminIds = new Set(adminUsers.map(admin => admin.id));

			setSelectedUser({
				...updatedUser,
				isAdmin: adminIds.has(updatedUser.id),
			});
		}
	};

	const createUserMutation = useUsersControllerCreate({
		mutation: {
			meta: {
				operationContext: "create user",
			},
			onSuccess: () => {
				toast.success("User created successfully");

				queryClient.invalidateQueries({
					queryKey: getUsersControllerFindAllBySchoolQueryKey(
						schoolId!
					),
				});

				setCreateDialogOpen(false);
			},
		},
	});

	const updateUserMutation = useUsersControllerUpdate({
		mutation: {
			meta: {
				operationContext: "update user",
			},
			onSuccess: () => {
				toast.success("User updated successfully");

				queryClient.invalidateQueries({
					queryKey: getUsersControllerFindAllBySchoolQueryKey(
						schoolId!
					),
				});

				setEditDialogOpen(false);
			},
		},
	});

	const deleteUserMutation = useUsersControllerRemove({
		mutation: {
			meta: {
				operationContext: "delete user",
			},
			onSuccess: () => {
				toast.success("User deleted successfully");

				queryClient.invalidateQueries({
					queryKey: getUsersControllerFindAllBySchoolQueryKey(
						schoolId!
					),
				});

				setDeleteDialogOpen(false);
			},
		},
	});

	const promoteToAdminMutation = useSchoolsControllerPromoteToAdmin({
		mutation: {
			meta: {
				operationContext: "grant admin role",
			},
			onSuccess: () => {
				toast.success("Admin role granted successfully");

				queryClient.invalidateQueries({
					queryKey: getSchoolsControllerGetAdminsQueryKey(schoolId!),
				});
			},
		},
	});

	const demoteFromAdminMutation = useSchoolsControllerDemoteFromAdmin({
		mutation: {
			meta: {
				operationContext: "remove admin role",
			},
			onSuccess: () => {
				toast.success("Admin role removed successfully");

				queryClient.invalidateQueries({
					queryKey: getSchoolsControllerGetAdminsQueryKey(schoolId!),
				});
			},
		},
	});

	const inviteUserMutation = useInvitesControllerCreateInvite({
		mutation: {
			meta: {
				operationContext: "send invite",
			},
			onSuccess: () => {
				if (!isBulkInvite) {
					toast.success("Invite sent successfully");
				}
			},
		},
	});

	const createStudentMutation = useStudentsControllerCreate({
		mutation: {
			meta: {
				operationContext: "add student role",
			},
			onSuccess: async () => {
				toast.success("Student role added successfully");

				await queryClient.invalidateQueries({
					queryKey: getUsersControllerFindAllBySchoolQueryKey(
						schoolId!
					),
				});

				updateSelectedUserFromCache();
			},
		},
	});

	const updateStudentMutation = useStudentsControllerUpdate({
		mutation: {
			meta: {
				operationContext: "update student",
			},
			onSuccess: async () => {
				toast.success("Student updated successfully");

				await queryClient.invalidateQueries({
					queryKey: getUsersControllerFindAllBySchoolQueryKey(
						schoolId!
					),
				});

				// Update the selected user with fresh data
				if (selectedUser) {
					const updatedUsers = queryClient.getQueryData<typeof users>(
						getUsersControllerFindAllBySchoolQueryKey(schoolId!)
					);

					const updatedUser = updatedUsers?.find(
						currentUser => currentUser.id === selectedUser.id
					);

					if (updatedUser) {
						const adminIds = new Set(
							adminUsers.map(admin => admin.id)
						);

						setSelectedUser({
							...updatedUser,
							isAdmin: adminIds.has(updatedUser.id),
						});
					}
				}
			},
		},
	});

	const removeStudentMutation = useStudentsControllerRemove({
		mutation: {
			meta: {
				operationContext: "remove student role",
			},
			onSuccess: async () => {
				toast.success("Student role removed successfully");

				await queryClient.invalidateQueries({
					queryKey: getUsersControllerFindAllBySchoolQueryKey(
						schoolId!
					),
				});

				// Update the selected user with fresh data
				if (selectedUser) {
					const updatedUsers = queryClient.getQueryData<typeof users>(
						getUsersControllerFindAllBySchoolQueryKey(schoolId!)
					);

					const updatedUser = updatedUsers?.find(
						currentUser => currentUser.id === selectedUser.id
					);

					if (updatedUser) {
						const adminIds = new Set(
							adminUsers.map(admin => admin.id)
						);

						setSelectedUser({
							...updatedUser,
							isAdmin: adminIds.has(updatedUser.id),
						});
					}
				}
			},
		},
	});

	const createTeacherMutation = useTeachersControllerCreate({
		mutation: {
			meta: {
				operationContext: "add teacher role",
			},
			onSuccess: async () => {
				toast.success("Teacher role added successfully");

				await queryClient.invalidateQueries({
					queryKey: getUsersControllerFindAllBySchoolQueryKey(
						schoolId!
					),
				});

				if (selectedUser) {
					const updatedUsers = queryClient.getQueryData<typeof users>(
						getUsersControllerFindAllBySchoolQueryKey(schoolId!)
					);

					const updatedUser = updatedUsers?.find(
						currentUser => currentUser.id === selectedUser.id
					);

					if (updatedUser) {
						const adminIds = new Set(
							adminUsers.map(admin => admin.id)
						);

						setSelectedUser({
							...updatedUser,
							isAdmin: adminIds.has(updatedUser.id),
						});
					}
				}
			},
		},
	});

	const updateTeacherMutation = useTeachersControllerUpdate({
		mutation: {
			meta: {
				operationContext: "update teacher",
			},
			onSuccess: async () => {
				toast.success("Teacher updated successfully");

				await queryClient.invalidateQueries({
					queryKey: getUsersControllerFindAllBySchoolQueryKey(
						schoolId!
					),
				});

				if (selectedUser) {
					const updatedUsers = queryClient.getQueryData<typeof users>(
						getUsersControllerFindAllBySchoolQueryKey(schoolId!)
					);

					const updatedUser = updatedUsers?.find(
						currentUser => currentUser.id === selectedUser.id
					);

					if (updatedUser) {
						const adminIds = new Set(
							adminUsers.map(admin => admin.id)
						);

						setSelectedUser({
							...updatedUser,
							isAdmin: adminIds.has(updatedUser.id),
						});
					}
				}
			},
		},
	});

	const removeTeacherMutation = useTeachersControllerRemove({
		mutation: {
			meta: {
				operationContext: "remove teacher role",
			},
			onSuccess: async () => {
				toast.success("Teacher role removed successfully");

				await queryClient.invalidateQueries({
					queryKey: getUsersControllerFindAllBySchoolQueryKey(
						schoolId!
					),
				});

				if (selectedUser) {
					const updatedUsers = queryClient.getQueryData<typeof users>(
						getUsersControllerFindAllBySchoolQueryKey(schoolId!)
					);

					const updatedUser = updatedUsers?.find(
						currentUser => currentUser.id === selectedUser.id
					);

					if (updatedUser) {
						const adminIds = new Set(
							adminUsers.map(admin => admin.id)
						);

						setSelectedUser({
							...updatedUser,
							isAdmin: adminIds.has(updatedUser.id),
						});
					}
				}
			},
		},
	});

	// Handlers
	const handleCreateUser = (data: CreateUserDto) => {
		createUserMutation.mutate({ data });
	};

	const handleEditUser = (userId: string, data: UpdateUserDto) => {
		updateUserMutation.mutate({ id: userId, data });
	};

	const handleDeleteUser = (userId: string) => {
		deleteUserMutation.mutate({ id: userId });
	};

	const handleToggleAdmin = (user: UserWithRoles) => {
		setSelectedUser(user);
		setToggleAdminDialogOpen(true);
	};

	const handleConfirmToggleAdmin = () => {
		if (!schoolId || !selectedUser) return;

		if (selectedUser.isAdmin) {
			demoteFromAdminMutation.mutate({
				id: schoolId,
				userId: selectedUser.id,
			});
		} else {
			promoteToAdminMutation.mutate({
				id: schoolId,
				userId: selectedUser.id,
			});
		}
	};

	const handleInviteUser = (userId: string, ttlSeconds?: number) => {
		if (isBulkInvite && bulkInviteUsers.length > 0) {
			// Bulk invite
			const promises = bulkInviteUsers.map(user =>
				inviteUserMutation.mutateAsync({
					data: {
						userId: user.id,
						ttlSeconds,
					},
				})
			);

			Promise.all(promises)
				.then(() => {
					toast.success(
						`Invites sent to ${bulkInviteUsers.length} users`
					);
				})
				.catch(() => {
					toast.error("Failed to send some invites");
				})
				.finally(() => {
					setIsBulkInvite(false);
					setBulkInviteUsers([]);
				});
		} else {
			// Single invite
			inviteUserMutation.mutate({
				data: {
					userId,
					ttlSeconds,
				},
			});
		}
	};

	const handleBulkInvite = (users: UserWithRoles[]) => {
		setBulkInviteUsers(users);
		setIsBulkInvite(users.length > 1);

		setSelectedUser(
			users.length === 1
				? users[0]
				: {
						...users[0],
						firstName: `${users.length} users`,
						lastName: "",
					}
		);
		setInviteDialogOpen(true);
	};

	const handleAddStudent = (userId: string, classId: string) => {
		createStudentMutation.mutate({
			data: {
				userId,
				classId,
			},
		});
	};

	const handleRemoveStudent = (studentId: string) => {
		removeStudentMutation.mutate({ id: studentId });
	};

	const handleUpdateStudent = (studentId: string, classId: string) => {
		updateStudentMutation.mutate({
			id: studentId,
			data: { classId },
		});
	};

	const handleAddTeacher = (userId: string, subjectIds: string[]) => {
		createTeacherMutation.mutate({
			data: {
				userId,
				subjectIds,
			},
		});
	};

	const handleRemoveTeacher = (teacherId: string) => {
		removeTeacherMutation.mutate({ id: teacherId });
	};

	const handleUpdateTeacher = (teacherId: string, subjectIds: string[]) => {
		updateTeacherMutation.mutate({
			id: teacherId,
			data: { subjectIds },
		});
	};

	const columns = createUserColumns({
		onEdit: user => {
			setSelectedUser(user);
			setEditDialogOpen(true);
		},
		onDelete: user => {
			setSelectedUser(user);
			setDeleteDialogOpen(true);
		},
		onToggleAdmin: handleToggleAdmin,
		onInvite: user => {
			setSelectedUser(user);
			setInviteDialogOpen(true);
		},
		onManageRoles: user => {
			setSelectedUser(user);
			setManageRolesDialogOpen(true);
		},
		currentUser:
			usersWithAdminStatus.find(user => user.id === currentUser?.id) ??
			null,
	});

	return (
		<SchoolRequired>
			<div className="container mx-auto space-y-6 py-10">
				<div className="px-2 sm:px-4">
					<h1 className="text-3xl font-bold tracking-tight">
						User Management
					</h1>
					<p className="text-muted-foreground">
						Manage users, assign roles, and send invitations.
					</p>
				</div>

				<UsersDataTable
					columns={columns}
					data={usersWithAdminStatus}
					onCreateUser={() => setCreateDialogOpen(true)}
					onBulkInvite={handleBulkInvite}
					classes={classes}
					subjects={subjects}
				/>

				<CreateUserDialog
					open={createDialogOpen}
					onOpenChange={setCreateDialogOpen}
					onSubmit={handleCreateUser}
					schoolId={schoolId!}
				/>

				<EditUserDialog
					open={editDialogOpen}
					onOpenChange={setEditDialogOpen}
					onSubmit={handleEditUser}
					user={selectedUser}
				/>

				<DeleteUserDialog
					open={deleteDialogOpen}
					onOpenChange={setDeleteDialogOpen}
					onConfirm={handleDeleteUser}
					user={selectedUser}
				/>

				<ToggleAdminDialog
					open={toggleAdminDialogOpen}
					onOpenChange={setToggleAdminDialogOpen}
					onConfirm={handleConfirmToggleAdmin}
					user={selectedUser}
					currentUser={
						currentUser
							? (usersWithAdminStatus.find(
									user => user.id === currentUser.id
								) ?? null)
							: null
					}
				/>

				<InviteUserDialog
					open={inviteDialogOpen}
					onOpenChange={setInviteDialogOpen}
					onConfirm={handleInviteUser}
					user={selectedUser}
					isBulk={isBulkInvite}
				/>

				<ManageRolesDialog
					open={manageRolesDialogOpen}
					onOpenChange={setManageRolesDialogOpen}
					user={selectedUser}
					classes={classes}
					subjects={subjects}
					onAddStudent={handleAddStudent}
					onRemoveStudent={handleRemoveStudent}
					onUpdateStudent={handleUpdateStudent}
					onAddTeacher={handleAddTeacher}
					onRemoveTeacher={handleRemoveTeacher}
					onUpdateTeacher={handleUpdateTeacher}
				/>
			</div>
		</SchoolRequired>
	);
}
