import type { SchoolEntity } from "@/api/generated/models";
import { useClassesControllerFindAllBySchool } from "@/api/generated/endpoints/classes/classes";
import { useUsersControllerFindAllBySchool } from "@/api/generated/endpoints/users/users";
import { useLessonsControllerFindFiltered } from "@/api/generated/endpoints/lessons/lessons";
import { Button } from "@/components/ui/button";
import {
	School,
	Pencil,
	Trash2,
	Users,
	GraduationCap,
	BookOpen,
	MoreHorizontal,
	Check,
} from "lucide-react";
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
	DropdownMenuTrigger,
	DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { StatCard } from "./stat-card";
import { useSchool } from "@/context/school-context";
import { useNavigate } from "@tanstack/react-router";
import { cn } from "@/lib/utils";

interface SchoolCardProps {
	school: SchoolEntity;
	onEdit: (school: SchoolEntity) => void;
	onDelete: (school: SchoolEntity) => void;
}

export function SchoolCard({ school, onEdit, onDelete }: SchoolCardProps) {
	const { schoolId, setSchoolId } = useSchool();
	const navigate = useNavigate();

	const { data: users } = useUsersControllerFindAllBySchool(school.id);
	const { data: classes } = useClassesControllerFindAllBySchool(school.id);
	const { data: lessons } = useLessonsControllerFindFiltered(school.id, {});

	const isCurrentSchool = schoolId === school.id;

	const handleSetCurrent = () => {
		setSchoolId(school.id);
	};

	return (
		<Card
			className={cn(
				"overflow-hidden hover:shadow-md transition-all py-0 pb-6",
				isCurrentSchool && "border-primary"
			)}>
			<CardHeader className="bg-primary/5 border-b pt-6">
				<CardTitle
					className="flex items-center gap-2 text-primary cursor-pointer hover:underline group"
					onClick={handleSetCurrent}>
					<School className="h-5 w-5" />
					{school.name}
					{isCurrentSchool && (
						<span className="ml-auto text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full flex items-center gap-1">
							<Check className="w-3 h-3" /> Current
						</span>
					)}
				</CardTitle>

				<CardDescription>
					Created {new Date(school.createdAt).toLocaleDateString()}
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
							<DropdownMenuItem onClick={handleSetCurrent}>
								<Check className="mr-2 h-4 w-4" />
								Set as Current
							</DropdownMenuItem>

							<DropdownMenuSeparator />

							<DropdownMenuItem onClick={() => onEdit(school)}>
								<Pencil className="mr-2 h-4 w-4" />
								Edit
							</DropdownMenuItem>

							<DropdownMenuItem
								className="text-destructive"
								onClick={() => onDelete(school)}>
								<Trash2 className="mr-2 h-4 w-4 text-destructive" />
								Delete
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				</CardAction>
			</CardHeader>

			<CardContent className="pt-6">
				<div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
					<StatCard
						icon={Users}
						count={users?.length ?? 0}
						label="Users"
						colorClass="text-primary"
						onClick={() => {
							setSchoolId(school.id);
							navigate({ to: "/users" });
						}}
					/>

					<StatCard
						icon={GraduationCap}
						count={classes?.length ?? 0}
						label="Classes"
						colorClass="text-chart-4"
						onClick={() => {
							setSchoolId(school.id);
							navigate({ to: "/academics" });
						}}
					/>

					<StatCard
						icon={BookOpen}
						count={lessons?.length ?? 0}
						label="Lessons"
						colorClass="text-chart-3"
						className="hidden sm:flex"
						onClick={() => {
							setSchoolId(school.id);
							navigate({ to: "/schedule" });
						}}
					/>
				</div>
			</CardContent>
		</Card>
	);
}
