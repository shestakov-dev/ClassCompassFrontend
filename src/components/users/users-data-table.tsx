"use client";
"use no memo";

import { useState, useMemo, useEffect } from "react";
import {
	type ColumnDef,
	type ColumnFiltersState,
	type SortingState,
	type VisibilityState,
	type Table as ReactTableType,
	flexRender,
	getCoreRowModel,
	getFilteredRowModel,
	getPaginationRowModel,
	getSortedRowModel,
	useReactTable,
} from "@tanstack/react-table";
import {
	UserPlus,
	Mail,
	Settings2,
	Check,
	X,
	GraduationCap,
	BookOpen,
	ShieldCheck,
	ListFilter,
	Search,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuCheckboxItem,
	DropdownMenuContent,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
	Empty,
	EmptyHeader,
	EmptyTitle,
	EmptyDescription,
	EmptyContent,
} from "@/components/ui/empty";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
	CommandSeparator,
} from "@/components/ui/command";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import {
	Select,
	SelectTrigger,
	SelectContent,
	SelectItem,
	SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

import type { UserWithRoles } from "@/components/users/user-columns";
import type { ClassEntity } from "@/api/generated/models/classEntity";
import type { SubjectEntity } from "@/api/generated/models/subjectEntity";

interface CombinedDataTableFilterProps<TData> {
	table: ReactTableType<TData>;
	classes: ClassEntity[];
	subjects: SubjectEntity[];
	classFilter: string[];
	setClassFilter: (val: string[]) => void;
	subjectFilter: string[];
	setSubjectFilter: (val: string[]) => void;
}

function CombinedDataTableFilter<TData>({
	table,
	classes,
	subjects,
	classFilter,
	setClassFilter,
	subjectFilter,
	setSubjectFilter,
}: CombinedDataTableFilterProps<TData>) {
	const [open, setOpen] = useState(false);

	const rolesColumn = table.getColumn("roles");
	const adminColumn = table.getColumn("admin");

	const rolesFilterValue = rolesColumn?.getFilterValue() as
		| string[]
		| undefined;
	const adminFilterValue = adminColumn?.getFilterValue() as
		| string[]
		| undefined;

	const selectedRoles = useMemo(
		() => new Set(rolesFilterValue ?? []),
		[rolesFilterValue]
	);
	const selectedAdmin = useMemo(
		() => new Set(adminFilterValue ?? []),
		[adminFilterValue]
	);
	const selectedClasses = useMemo(() => new Set(classFilter), [classFilter]);
	const selectedSubjects = useMemo(
		() => new Set(subjectFilter),
		[subjectFilter]
	);

	const totalFilters =
		selectedRoles.size +
		selectedAdmin.size +
		selectedClasses.size +
		selectedSubjects.size;

	const toggleFilter = (
		selectedSet: Set<string>,
		value: string,
		updater: (newVal: string[] | undefined) => void
	) => {
		const newSet = new Set(selectedSet);

		if (newSet.has(value)) {
			newSet.delete(value);
		} else {
			newSet.add(value);
		}

		const newArray = Array.from(newSet);
		updater(newArray.length ? newArray : undefined);
	};

	useEffect(() => {
		if (
			selectedRoles.size > 0 &&
			!selectedRoles.has("student") &&
			selectedClasses.size > 0
		) {
			setClassFilter([]);
		}

		if (
			selectedRoles.size > 0 &&
			!selectedRoles.has("teacher") &&
			selectedSubjects.size > 0
		) {
			setSubjectFilter([]);
		}
	}, [
		selectedRoles,
		selectedClasses.size,
		selectedSubjects.size,
		setClassFilter,
		setSubjectFilter,
	]);

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger asChild>
				<Button
					variant="outline"
					size="sm"
					className="sm:w-auto w-8 p-0 sm:px-3">
					<ListFilter className="h-4 w-4" />
					<span className="ml-2 hidden sm:inline">Filters</span>

					{totalFilters > 0 && (
						<>
							<Separator
								orientation="vertical"
								className="mx-2 h-4 hidden sm:block"
							/>
							<Badge
								variant="secondary"
								className="rounded-sm px-1 font-normal hidden sm:inline-flex">
								{totalFilters}
							</Badge>
						</>
					)}
				</Button>
			</PopoverTrigger>

			<PopoverContent className="w-70 p-0" align="start">
				<Command>
					<CommandInput placeholder="Filter by role, class..." />

					<CommandList className="max-h-100 overflow-y-auto">
						<CommandEmpty>No filters found.</CommandEmpty>

						<CommandGroup heading="Roles">
							<CommandItem
								onSelect={() =>
									toggleFilter(
										selectedRoles,
										"student",
										val => rolesColumn?.setFilterValue(val)
									)
								}>
								<div
									className={cn(
										"mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
										selectedRoles.has("student")
											? "bg-primary text-primary-foreground"
											: "opacity-50 [&_svg]:invisible"
									)}>
									<Check className="h-4 w-4" />
								</div>

								<GraduationCap className="mr-2 h-4 w-4 text-muted-foreground" />
								<span>Student</span>
							</CommandItem>

							<CommandItem
								onSelect={() =>
									toggleFilter(
										selectedRoles,
										"teacher",
										val => rolesColumn?.setFilterValue(val)
									)
								}>
								<div
									className={cn(
										"mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
										selectedRoles.has("teacher")
											? "bg-primary text-primary-foreground"
											: "opacity-50 [&_svg]:invisible"
									)}>
									<Check className="h-4 w-4" />
								</div>

								<BookOpen className="mr-2 h-4 w-4 text-muted-foreground" />
								<span>Teacher</span>
							</CommandItem>
						</CommandGroup>

						<CommandSeparator />

						<CommandGroup heading="Admin Status">
							<CommandItem
								onSelect={() =>
									toggleFilter(selectedAdmin, "true", val =>
										adminColumn?.setFilterValue(val)
									)
								}>
								<div
									className={cn(
										"mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
										selectedAdmin.has("true")
											? "bg-primary text-primary-foreground"
											: "opacity-50 [&_svg]:invisible"
									)}>
									<Check className="h-4 w-4" />
								</div>

								<ShieldCheck className="mr-2 h-4 w-4 text-muted-foreground" />
								<span>Is Admin</span>
							</CommandItem>
						</CommandGroup>

						<CommandSeparator />

						{(selectedRoles.has("student") ||
							selectedRoles.size === 0) &&
							classes.length > 0 && (
								<>
									<CommandGroup heading="Classes">
										{classes.map(cls => (
											<CommandItem
												key={cls.id}
												value={`class-${cls.name}`}
												onSelect={() =>
													toggleFilter(
														selectedClasses,
														cls.id,
														val =>
															setClassFilter(
																val ?? []
															)
													)
												}>
												<div
													className={cn(
														"mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
														selectedClasses.has(
															cls.id
														)
															? "bg-primary text-primary-foreground"
															: "opacity-50 [&_svg]:invisible"
													)}>
													<Check className="h-4 w-4" />
												</div>

												<span>{cls.name}</span>
											</CommandItem>
										))}
									</CommandGroup>

									<CommandSeparator />
								</>
							)}

						{(selectedRoles.has("teacher") ||
							selectedRoles.size === 0) &&
							subjects.length > 0 && (
								<CommandGroup heading="Subjects">
									{subjects.map(sub => (
										<CommandItem
											key={sub.id}
											value={`subject-${sub.name}`}
											onSelect={() =>
												toggleFilter(
													selectedSubjects,
													sub.id,
													val =>
														setSubjectFilter(
															val ?? []
														)
												)
											}>
											<div
												className={cn(
													"mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
													selectedSubjects.has(sub.id)
														? "bg-primary text-primary-foreground"
														: "opacity-50 [&_svg]:invisible"
												)}>
												<Check className="h-4 w-4" />
											</div>

											<span>{sub.name}</span>
										</CommandItem>
									))}
								</CommandGroup>
							)}

						{totalFilters > 0 && (
							<>
								<CommandSeparator />

								<CommandGroup>
									<CommandItem
										onSelect={() => {
											rolesColumn?.setFilterValue(
												undefined
											);
											adminColumn?.setFilterValue(
												undefined
											);
											setClassFilter([]);
											setSubjectFilter([]);
										}}
										className="justify-center text-center">
										Clear all filters
									</CommandItem>
								</CommandGroup>
							</>
						)}
					</CommandList>
				</Command>
			</PopoverContent>
		</Popover>
	);
}

interface DataTableViewOptionsProps<TData> {
	table: ReactTableType<TData>;
}

const COLUMN_LABELS: Record<string, string> = {
	firstName: "First Name",
	lastName: "Last Name",
	email: "Email",
	roles: "Roles",
	admin: "Admin Status",
	createdAt: "Date Created",
	actions: "Actions",
	select: "Select",
};

function DataTableViewOptions<TData>({
	table,
}: DataTableViewOptionsProps<TData>) {
	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button
					variant="outline"
					size="sm"
					className="sm:w-auto w-8 p-0 sm:px-3">
					<Settings2 className="h-4 w-4" />
					<span className="ml-2 hidden sm:inline">Columns</span>
				</Button>
			</DropdownMenuTrigger>

			<DropdownMenuContent align="end" className="w-37.5">
				<DropdownMenuLabel>Toggle columns</DropdownMenuLabel>

				<DropdownMenuSeparator />

				{table
					.getAllColumns()
					.filter(
						column =>
							typeof column.accessorFn !== "undefined" &&
							column.getCanHide()
					)
					.map(column => {
						return (
							<DropdownMenuCheckboxItem
								key={column.id}
								className="capitalize"
								checked={column.getIsVisible()}
								onCheckedChange={value =>
									column.toggleVisibility(!!value)
								}
								onSelect={e => e.preventDefault()}>
								{COLUMN_LABELS[column.id] ?? column.id}
							</DropdownMenuCheckboxItem>
						);
					})}
			</DropdownMenuContent>
		</DropdownMenu>
	);
}

interface UsersDataTableProps<TData, TValue> {
	columns: ColumnDef<TData, TValue>[];
	data: TData[];
	onCreateUser: () => void;
	onBulkInvite: (users: TData[]) => void;
	classes?: ClassEntity[];
	subjects?: SubjectEntity[];
}

export function UsersDataTable<TData extends UserWithRoles, TValue>({
	columns,
	data,
	onCreateUser,
	onBulkInvite,
	classes = [],
	subjects = [],
}: UsersDataTableProps<TData, TValue>) {
	const [sorting, setSorting] = useState<SortingState>([]);
	const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
	const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({
		admin: false,
	});
	const [rowSelection, setRowSelection] = useState({});
	const [globalFilter, setGlobalFilter] = useState("");
	const [classFilter, setClassFilter] = useState<string[]>([]);
	const [subjectFilter, setSubjectFilter] = useState<string[]>([]);

	useEffect(() => {
		const handleResize = () => {
			const isSmall = window.matchMedia("(max-width: 640px)").matches;
			const isMedium = window.matchMedia("(max-width: 1024px)").matches;
			const isBelowXL = window.matchMedia("(max-width: 1280px)").matches;

			setColumnVisibility(prev => {
				const newVisibility = { ...prev };

				if (isSmall) {
					newVisibility.email = false;
					newVisibility.createdAt = false;
					newVisibility.lastName = true;
					newVisibility.admin = false;
				} else if (isMedium) {
					newVisibility.email = false;
					newVisibility.createdAt = false;
					newVisibility.lastName = true;
					newVisibility.admin = false;
				} else if (isBelowXL) {
					newVisibility.admin = false;
				}

				return newVisibility;
			});
		};

		// Initial check
		handleResize();

		window.addEventListener("resize", handleResize);

		return () => window.removeEventListener("resize", handleResize);
	}, []);

	const filteredData = useMemo(() => {
		let filtered = data;

		if (classFilter.length > 0) {
			filtered = filtered.filter(
				user =>
					user.student?.classId &&
					classFilter.includes(user.student.classId)
			);
		}

		if (subjectFilter.length > 0) {
			filtered = filtered.filter(user =>
				user.teacher?.subjects?.some(subject =>
					subjectFilter.includes(subject.id)
				)
			);
		}

		return filtered;
	}, [data, classFilter, subjectFilter]);

	// eslint-disable-next-line react-hooks/incompatible-library
	const table = useReactTable({
		data: filteredData,
		columns,
		onSortingChange: setSorting,
		onColumnFiltersChange: setColumnFilters,
		getCoreRowModel: getCoreRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		getSortedRowModel: getSortedRowModel(),
		getFilteredRowModel: getFilteredRowModel(),
		onColumnVisibilityChange: setColumnVisibility,
		onRowSelectionChange: setRowSelection,
		onGlobalFilterChange: setGlobalFilter,
		globalFilterFn: (row, _columnId, filterValue) => {
			const user = row.original;
			const searchValue = filterValue.toLowerCase();

			return (
				user.firstName.toLowerCase().includes(searchValue) ||
				user.lastName.toLowerCase().includes(searchValue) ||
				user.email.toLowerCase().includes(searchValue)
			);
		},
		state: {
			sorting,
			columnFilters,
			columnVisibility,
			rowSelection,
			globalFilter,
		},
	});

	const selectedRows = table.getFilteredSelectedRowModel().rows;
	const selectedUsers = selectedRows.map(row => row.original);

	// Determine if any filters are applied (excluding search bar)
	const isFiltered =
		table.getState().columnFilters.length > 0 ||
		classFilter.length > 0 ||
		subjectFilter.length > 0;

	// This includes the search bar as well
	const hasActiveFilters =
		globalFilter.length > 0 ||
		columnFilters.length > 0 ||
		classFilter.length > 0 ||
		subjectFilter.length > 0;

	return (
		<div className="w-full space-y-4 px-2 sm:px-4">
			<div className="flex flex-col gap-4">
				{/* Search Bar */}
				<div className="w-full relative">
					<Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
					<Input
						placeholder="Search users..."
						value={globalFilter}
						onChange={event => setGlobalFilter(event.target.value)}
						className="h-8 w-full pl-8 pr-8"
					/>
					{globalFilter && (
						<Button
							variant="ghost"
							size="sm"
							onClick={() => setGlobalFilter("")}
							className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6 p-0 hover:bg-transparent">
							<X className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground" />
						</Button>
					)}
				</div>

				{/* Action Row */}
				<div className="flex flex-wrap gap-2 items-center justify-between">
					{/* Left Side: Filter & Reset */}
					<div className="flex items-center gap-2">
						<CombinedDataTableFilter
							table={table}
							classes={classes}
							subjects={subjects}
							classFilter={classFilter}
							setClassFilter={setClassFilter}
							subjectFilter={subjectFilter}
							setSubjectFilter={setSubjectFilter}
						/>

						{isFiltered && (
							<Button
								variant="ghost"
								onClick={() => {
									table.resetColumnFilters();
									setClassFilter([]);
									setSubjectFilter([]);
								}}
								className="h-8 px-2 lg:px-3">
								Reset
								<X className="ml-2 h-4 w-4" />
							</Button>
						)}
					</div>

					{/* Right Side: Actions */}
					<div className="flex items-center gap-2">
						{selectedRows.length > 0 && (
							<Button
								variant="outline"
								size="sm"
								className="h-8"
								onClick={() => onBulkInvite(selectedUsers)}>
								<Mail className="h-4 w-4" />
								<span className="ml-2 hidden sm:inline">
									Invite ({selectedRows.length})
								</span>
							</Button>
						)}

						<Button
							onClick={onCreateUser}
							size="sm"
							className="h-8">
							<UserPlus className="mr-2 h-4 w-4" />
							<span className="hidden sm:inline">Add User</span>
							<span className="inline sm:hidden">Add</span>
						</Button>

						<DataTableViewOptions table={table} />
					</div>
				</div>
			</div>

			{/* Table Container */}
			<div className="rounded-md border overflow-x-auto">
				<Table>
					<TableHeader>
						{table.getHeaderGroups().map(headerGroup => (
							<TableRow key={headerGroup.id}>
								{headerGroup.headers.map(header => {
									return (
										<TableHead
											key={header.id}
											colSpan={header.colSpan}>
											{header.isPlaceholder
												? null
												: flexRender(
														header.column.columnDef
															.header,
														header.getContext()
													)}
										</TableHead>
									);
								})}
							</TableRow>
						))}
					</TableHeader>

					<TableBody>
						{table.getRowModel().rows?.length ? (
							table.getRowModel().rows.map(row => (
								<TableRow
									key={row.id}
									data-state={
										row.getIsSelected() && "selected"
									}>
									{row.getVisibleCells().map(cell => (
										<TableCell key={cell.id}>
											{flexRender(
												cell.column.columnDef.cell,
												cell.getContext()
											)}
										</TableCell>
									))}
								</TableRow>
							))
						) : (
							<TableRow>
								<TableCell
									colSpan={columns.length}
									className="h-60">
									<Empty>
										<EmptyHeader>
											<EmptyTitle>
												No users found
											</EmptyTitle>
											<EmptyDescription>
												Try adjusting your filters or
												search terms
											</EmptyDescription>
										</EmptyHeader>
										<EmptyContent>
											{hasActiveFilters && (
												<Button
													variant="outline"
													size="sm"
													onClick={() => {
														setGlobalFilter("");
														table.resetColumnFilters();
														setClassFilter([]);
														setSubjectFilter([]);
													}}>
													Clear all filters
												</Button>
											)}
										</EmptyContent>
									</Empty>
								</TableCell>
							</TableRow>
						)}
					</TableBody>
				</Table>
			</div>

			{/* Pagination */}
			<div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
				<div className="text-sm text-muted-foreground order-2 sm:order-1">
					{table.getFilteredSelectedRowModel().rows.length} of{" "}
					{table.getFilteredRowModel().rows.length} row(s) selected.
				</div>

				<div className="flex items-center space-x-4 lg:space-x-8 order-1 sm:order-2">
					<div className="flex items-center space-x-2">
						<p className="text-sm font-medium hidden sm:block">
							Rows per page
						</p>

						<Select
							value={`${table.getState().pagination.pageSize}`}
							onValueChange={value => {
								table.setPageSize(Number(value));
							}}>
							<SelectTrigger className="h-8 w-17.5">
								<SelectValue
									placeholder={
										table.getState().pagination.pageSize
									}
								/>
							</SelectTrigger>

							<SelectContent side="top">
								{[10, 20, 30, 40, 50].map(pageSize => (
									<SelectItem
										key={pageSize}
										value={`${pageSize}`}>
										{pageSize}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>

					<div className="flex w-25 items-center justify-center text-sm font-medium">
						Page {table.getState().pagination.pageIndex + 1} of{" "}
						{table.getPageCount()}
					</div>

					<div className="flex items-center space-x-2">
						<Button
							variant="outline"
							size="sm"
							className="h-8 w-8 p-0"
							onClick={() => table.previousPage()}
							disabled={!table.getCanPreviousPage()}>
							<span className="sr-only">Go to previous page</span>
							{"<"}
						</Button>
						<Button
							variant="outline"
							size="sm"
							className="h-8 w-8 p-0"
							onClick={() => table.nextPage()}
							disabled={!table.getCanNextPage()}>
							<span className="sr-only">Go to next page</span>
							{">"}
						</Button>
					</div>
				</div>
			</div>
		</div>
	);
}
