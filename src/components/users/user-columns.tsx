"use client";

import { type ColumnDef } from "@tanstack/react-table";
import {
	ArrowUpDown,
	MoreHorizontal,
	GraduationCap,
	BookOpen,
	ShieldCheck,
	UserCog,
	Trash2,
	Mail,
	Shield,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { type UserEntity } from "@/api/generated/models/userEntity";
import { cn } from "@/lib/utils";

export type UserWithRoles = UserEntity & {
	isAdmin?: boolean;
	roles?: string[];
};

interface ColumnActionsProps {
	onEdit: (user: UserWithRoles) => void;
	onDelete: (user: UserWithRoles) => void;
	onToggleAdmin: (user: UserWithRoles) => void;
	onInvite: (user: UserWithRoles) => void;
	onManageRoles: (user: UserWithRoles) => void;
	currentUser: UserWithRoles | null;
}

const BADGE_CLASSES = "gap-1 font-normal px-1.5 py-0 text-[10px] sm:text-xs";

export const createUserColumns = ({
	onEdit,
	onDelete,
	onToggleAdmin,
	onInvite,
	onManageRoles,
	currentUser,
}: ColumnActionsProps): ColumnDef<UserWithRoles>[] => [
	{
		id: "select",
		header: ({ table }) => (
			<div className="flex items-center justify-center">
				<Checkbox
					checked={
						table.getIsAllPageRowsSelected() ||
						(table.getIsSomePageRowsSelected() && "indeterminate")
					}
					onCheckedChange={value =>
						table.toggleAllPageRowsSelected(!!value)
					}
					aria-label="Select all"
				/>
			</div>
		),
		cell: ({ row }) => (
			<div className="flex items-center justify-center">
				<Checkbox
					checked={row.getIsSelected()}
					onCheckedChange={value => row.toggleSelected(!!value)}
					aria-label="Select row"
				/>
			</div>
		),
		enableSorting: false,
		enableHiding: false,
		size: 40,
	},
	{
		accessorKey: "firstName",
		header: ({ column }) => {
			return (
				<Button
					variant="ghost"
					className="sm:-ml-4 h-8 text-xs sm:text-sm"
					onClick={() =>
						column.toggleSorting(column.getIsSorted() === "asc")
					}>
					First Name
					<ArrowUpDown className="ml-2 h-3 w-3 sm:h-4 sm:w-4" />
				</Button>
			);
		},
		cell: ({ row }) => (
			<div className="font-medium truncate max-w-21.25 sm:max-w-none text-xs sm:text-sm pl-4 sm:pl-0">
				{row.getValue("firstName")}
			</div>
		),
	},
	{
		accessorKey: "lastName",
		header: ({ column }) => {
			return (
				<Button
					variant="ghost"
					className="sm:-ml-4 h-8 text-xs sm:text-sm"
					onClick={() =>
						column.toggleSorting(column.getIsSorted() === "asc")
					}>
					Last Name
					<ArrowUpDown className="ml-2 h-3 w-3 sm:h-4 sm:w-4" />
				</Button>
			);
		},
		cell: ({ row }) => (
			<div className="font-medium truncate max-w-21.25 sm:max-w-none text-xs sm:text-sm pl-4 sm:pl-0">
				{row.getValue("lastName")}
			</div>
		),
	},
	{
		accessorKey: "email",
		header: ({ column }) => {
			return (
				<Button
					variant="ghost"
					className="-ml-4 h-8"
					onClick={() =>
						column.toggleSorting(column.getIsSorted() === "asc")
					}>
					Email
					<ArrowUpDown className="ml-2 h-4 w-4" />
				</Button>
			);
		},
		cell: ({ row }) => (
			<div className="lowercase truncate max-w-37.5 lg:max-w-62.5">
				{row.getValue("email")}
			</div>
		),
	},
	{
		id: "roles",
		accessorFn: row => {
			const roles = [];
			if (row.student) roles.push("student");
			if (row.teacher) roles.push("teacher");
			return roles;
		},
		header: "Roles",
		cell: ({ row }) => {
			const user = row.original;

			return (
				<div className="flex flex-row flex-wrap gap-1.5 items-center">
					{user.isAdmin && (
						<Badge variant="default" className={BADGE_CLASSES}>
							<ShieldCheck className="h-3 w-3" />
							Admin
						</Badge>
					)}

					{user.student && (
						<Badge
							variant="outline"
							className={cn(
								BADGE_CLASSES,
								"bg-chart-4 border-chart-4 text-black"
							)}>
							<GraduationCap className="h-3 w-3" />
							Student
						</Badge>
					)}
					{user.teacher && (
						<Badge
							variant="outline"
							className={cn(
								BADGE_CLASSES,
								"bg-chart-3 border-chart-3 text-black"
							)}>
							<BookOpen className="h-3 w-3" />
							Teacher
						</Badge>
					)}
					{!user.student && !user.teacher && !user.isAdmin && (
						<span className="text-xs text-muted-foreground">—</span>
					)}
				</div>
			);
		},
		filterFn: (row, _id, filterValue: string[]) => {
			if (!filterValue || filterValue.length === 0) return true;
			const user = row.original;
			const userRoles: string[] = [];
			if (user.student) userRoles.push("student");
			if (user.teacher) userRoles.push("teacher");
			return filterValue.some(role => userRoles.includes(role));
		},
	},
	{
		id: "admin",
		accessorFn: row => (row.isAdmin ? "true" : "false"),
		header: "Admin",
		enableHiding: false,
		filterFn: (row, _id, filterValue: string[]) => {
			if (!filterValue || filterValue.length === 0) return true;
			const user = row.original;
			const isAdmin = user.isAdmin ? "true" : "false";
			return filterValue.includes(isAdmin);
		},
	},
	{
		accessorKey: "createdAt",
		header: ({ column }) => {
			return (
				<Button
					variant="ghost"
					className="-ml-4 h-8"
					onClick={() =>
						column.toggleSorting(column.getIsSorted() === "asc")
					}>
					Created
					<ArrowUpDown className="ml-2 h-4 w-4" />
				</Button>
			);
		},
		cell: ({ row }) => {
			const date = new Date(row.getValue("createdAt"));
			const formatted = date.toLocaleDateString("en-GB", {
				day: "2-digit",
				month: "2-digit",
				year: "numeric",
			});
			return (
				<div className="text-sm text-muted-foreground whitespace-nowrap">
					{formatted}
				</div>
			);
		},
	},
	{
		id: "actions",
		header: "",
		enableHiding: false,
		size: 40,
		cell: ({ row }) => {
			const user = row.original;

			return (
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button variant="ghost" className="h-8 w-8 p-0">
							<span className="sr-only">Open menu</span>
							<MoreHorizontal className="h-4 w-4" />
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="end">
						<DropdownMenuLabel className="text-xs font-semibold text-muted-foreground">
							Actions
						</DropdownMenuLabel>
						<DropdownMenuSeparator />
						<DropdownMenuItem onClick={() => onEdit(user)}>
							<UserCog className="mr-2 h-4 w-4" />
							Edit user
						</DropdownMenuItem>
						<DropdownMenuItem onClick={() => onManageRoles(user)}>
							<GraduationCap className="mr-2 h-4 w-4" />
							Manage roles
						</DropdownMenuItem>
						<DropdownMenuSeparator />
						<Tooltip>
							<TooltipTrigger asChild>
								<div>
									<DropdownMenuItem
										onClick={() => onToggleAdmin(user)}
										disabled={
											currentUser?.id === user.id &&
											user.isAdmin
										}>
										<Shield className="mr-2 h-4 w-4" />
										{user.isAdmin
											? "Demote from admin"
											: "Promote to admin"}
									</DropdownMenuItem>
								</div>
							</TooltipTrigger>
							{currentUser?.id === user.id && user.isAdmin && (
								<TooltipContent>
									<p>You cannot demote yourself from admin</p>
								</TooltipContent>
							)}
						</Tooltip>
						<DropdownMenuItem onClick={() => onInvite(user)}>
							<Mail className="mr-2 h-4 w-4" />
							Send invite
						</DropdownMenuItem>
						<DropdownMenuSeparator />
						<DropdownMenuItem
							onClick={() => onDelete(user)}
							className="text-destructive">
							<Trash2 className="mr-2 h-4 w-4" />
							Delete user
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			);
		},
	},
];
