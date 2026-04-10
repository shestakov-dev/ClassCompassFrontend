import {
	GraduationCap,
	MoreHorizontal,
	Pencil,
	Trash2,
	UserPlus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
	Card,
	CardHeader,
	CardTitle,
	CardDescription,
	CardAction,
	CardContent,
} from "@/components/ui/card";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuTrigger,
	DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import type { ClassEntity } from "@/api/generated/models/classEntity";
import type { StudentEntity } from "@/api/generated/models/studentEntity";
import type { UserEntity } from "@/api/generated/models/userEntity";

interface ClassCardProps {
	classEntity: ClassEntity;
	students: StudentEntity[];
	users: UserEntity[];
	onEdit: () => void;
	onDelete: () => void;
	onAssign: () => void;
}

export function ClassCard({
	classEntity,
	students,
	users,
	onEdit,
	onDelete,
	onAssign,
}: ClassCardProps) {
	const classStudents = students.filter(
		student => student.classId === classEntity.id
	);

	return (
		<Card className="overflow-hidden hover:shadow-md transition-all py-0 pb-6">
			<CardHeader className="bg-chart-4/10 border-b pt-6">
				<CardTitle className="flex items-center gap-2 text-chart-4">
					<GraduationCap className="h-5 w-5" />
					{classEntity.name}
				</CardTitle>

				<CardDescription>
					Created{" "}
					{new Date(classEntity.createdAt).toLocaleDateString()}
				</CardDescription>

				<CardAction>
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button
								variant="ghost"
								size="icon"
								className="h-8 w-8">
								<MoreHorizontal className="h-4 w-4" />
							</Button>
						</DropdownMenuTrigger>

						<DropdownMenuContent align="end">
							<DropdownMenuLabel className="text-xs font-semibold text-muted-foreground">
								Actions
							</DropdownMenuLabel>

							<DropdownMenuSeparator />

							<DropdownMenuItem onClick={onAssign}>
								<UserPlus className="mr-2 h-4 w-4" />
								Assign Students
							</DropdownMenuItem>

							<DropdownMenuSeparator />

							<DropdownMenuItem onClick={onEdit}>
								<Pencil className="mr-2 h-4 w-4" />
								Edit
							</DropdownMenuItem>

							<DropdownMenuItem
								className="text-destructive focus:text-destructive cursor-pointer"
								onClick={onDelete}>
								<Trash2 className="mr-2 h-4 w-4 text-destructive" />
								Delete
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				</CardAction>
			</CardHeader>

			<CardContent>
				<div className="space-y-3">
					<p className="text-sm font-medium text-muted-foreground">
						Students ({classStudents.length})
					</p>

					<div className="flex flex-wrap gap-1.5">
						{classStudents.length > 0 ? (
							<>
								{classStudents.slice(0, 3).map(student => {
									const user = users.find(
										user => user.student?.id === student.id
									);

									return (
										<Badge
											key={student.id}
											variant="outline"
											className="text-xs font-normal border-chart-4/30 bg-chart-4/5">
											{user?.firstName} {user?.lastName}
										</Badge>
									);
								})}

								{classStudents.length > 3 && (
									<Badge
										variant="outline"
										className="text-xs font-normal border-chart-4/30 bg-chart-4/5">
										+{classStudents.length - 3} more
									</Badge>
								)}
							</>
						) : (
							<span className="text-sm text-muted-foreground italic">
								No students assigned
							</span>
						)}
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
