import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Layers } from "lucide-react";
import type { FloorEntity } from "@/api/generated/models";

interface FloorSelectorProps {
	floors: FloorEntity[];
	selectedFloorId: string | undefined;
	onSelect: (floorId: string) => void;
}

export function FloorSelector({
	floors,
	selectedFloorId,
	onSelect,
}: FloorSelectorProps) {
	const sorted = [...floors].sort(
		(floor1, floor2) => floor1.number - floor2.number
	);

	return (
		<div className="flex items-center gap-2">
			<Layers className="h-4 w-4 text-muted-foreground shrink-0" />
			<Select value={selectedFloorId ?? ""} onValueChange={onSelect}>
				<SelectTrigger size="sm" className="h-8 min-w-44">
					<SelectValue placeholder="Select Floor" />
				</SelectTrigger>
				<SelectContent>
					{sorted.map(floor => (
						<SelectItem key={floor.id} value={floor.id}>
							<span>Floor {floor.number}</span>

							{floor.description && (
								<span className="ml-1.5 text-muted-foreground">
									({floor.description})
								</span>
							)}
						</SelectItem>
					))}
				</SelectContent>
			</Select>
		</div>
	);
}
