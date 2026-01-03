import { useSchool } from "@/context/school-context";
import { useSchoolsControllerFindAll } from "@/api/generated/endpoints/schools/schools";
import { Combobox } from "@/components/ui/combobox";
import { Building2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface SchoolSelectorProps {
	className?: string;
	size?: React.ComponentProps<typeof Button>["size"];
}

export function SchoolSelector({
	className,
	size = "sm",
}: SchoolSelectorProps) {
	const { schoolId, setSchoolId, canChangeSchool } = useSchool();

	const { data: schools } = useSchoolsControllerFindAll({
		query: {
			enabled: canChangeSchool,
		},
	});

	if (!canChangeSchool) {
		return null;
	}

	return (
		<div className="flex items-center gap-2">
			<Building2 className="h-4 w-4 text-muted-foreground" />
			<Combobox
				items={(schools ?? []).map(school => ({
					value: school.id,
					label: school.name,
				}))}
				value={schoolId ?? ""}
				onChange={setSchoolId}
				placeholder="Select school..."
				searchPlaceholder="Search schools..."
				emptyMessage="No schools found"
				className={cn("w-50", className)}
				size={size}
			/>
		</div>
	);
}
