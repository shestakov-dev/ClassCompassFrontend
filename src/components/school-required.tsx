import { Building2 } from "lucide-react";
import { useSession } from "@/context/session-context";
import { useSchool } from "@/context/school-context";
import { SchoolSelector } from "@/components/school-selector";

interface SchoolRequiredProps {
	children: React.ReactNode;
}

export function SchoolRequired({ children }: SchoolRequiredProps) {
	const { isPlatformAdmin } = useSession();
	const { schoolId } = useSchool();

	// If not a platform admin or school is selected, render children
	if (!isPlatformAdmin || schoolId) {
		return children;
	}

	// Platform admin without school selected - show message
	return (
		<div className="flex flex-col items-center justify-center flex-1 h-full p-8 text-center animate-in fade-in zoom-in-95 duration-300">
			<div className="rounded-full bg-muted p-6 mb-6">
				<Building2 className="h-10 w-10 text-muted-foreground" />
			</div>

			<h3 className="text-lg font-semibold mb-2">No School Selected</h3>

			<p className="text-muted-foreground max-w-sm mb-6">
				Please select a school to view this page.
			</p>

			<SchoolSelector className="w-60" size="default" />
		</div>
	);
}
