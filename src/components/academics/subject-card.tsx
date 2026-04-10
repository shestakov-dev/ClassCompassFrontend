import {
	BookOpen,
	MoreHorizontal,
	Pencil,
	Trash2,
	UserCog,
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
import type { SubjectEntity } from "@/api/generated/models/subjectEntity";
import type { UserEntity } from "@/api/generated/models/userEntity";

interface SubjectCardProps {
	subject: SubjectEntity;
	users: UserEntity[];
	onEdit: () => void;
	onDelete: () => void;
	onAssign: () => void;
}

export function SubjectCard({
	subject,
	users,
	onEdit,
	onDelete,
	onAssign,
}: SubjectCardProps) {
	const subjectTeachers = subject.teachers ?? [];

	return (
		<Card className="overflow-hidden hover:shadow-md transition-all py-0 pb-6">
			<CardHeader className="bg-chart-3/10 border-b pt-6">
				<CardTitle className="flex items-center gap-2 text-chart-3">
					<BookOpen className="h-5 w-5" />
					{subject.name}
				</CardTitle>

				<CardDescription>
					Created {new Date(subject.createdAt).toLocaleDateString()}
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
								<UserCog className="mr-2 h-4 w-4" />
								Assign Teachers
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
						Teachers ({subjectTeachers.length})
					</p>

					<div className="flex flex-wrap gap-1.5">
						{subjectTeachers.length > 0 ? (
							<>
								{subjectTeachers
									.slice(0, 3)
									.map((teacher, index) => {
										const user = users.find(
											user => user.id === teacher.userId
										);
										return (
											<Badge
												key={index}
												variant="outline"
												className="text-xs font-normal border-chart-3/30 bg-chart-3/5">
												{user?.firstName}{" "}
												{user?.lastName}
											</Badge>
										);
									})}
								{subjectTeachers.length > 3 && (
									<Badge
										variant="outline"
										className="text-xs font-normal border-chart-3/30 bg-chart-3/5">
										+{subjectTeachers.length - 3} more
									</Badge>
								)}
							</>
						) : (
							<span className="text-sm text-muted-foreground italic">
								No teachers assigned
							</span>
						)}
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
