import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Building2 } from "lucide-react";
import type { BuildingEntity } from "@/api/generated/models";

interface BuildingSelectorProps {
	buildings: BuildingEntity[];
	selectedBuildingId: string | undefined;
	onSelect: (buildingId: string) => void;
}

export function BuildingSelector({
	buildings,
	selectedBuildingId,
	onSelect,
}: BuildingSelectorProps) {
	return (
		<div className="flex items-center gap-2">
			<Building2 className="h-4 w-4 text-muted-foreground shrink-0" />
			<Select value={selectedBuildingId ?? ""} onValueChange={onSelect}>
				<SelectTrigger size="sm" className="h-8 min-w-40">
					<SelectValue placeholder="Select Building" />
				</SelectTrigger>
				<SelectContent>
					{buildings.map(building => (
						<SelectItem key={building.id} value={building.id}>
							{building.name}
						</SelectItem>
					))}
				</SelectContent>
			</Select>
		</div>
	);
}
