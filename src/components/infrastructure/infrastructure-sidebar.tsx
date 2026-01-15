import { Building, Edit2, Trash2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DashedButton } from "@/components/common/dashed-button";
import { cn } from "@/lib/utils";
import type { BuildingEntity } from "@/api/generated/models";
import type {
	DialogType,
	DialogMode,
	DialogData,
} from "@/types/infrastructure";

interface SidebarProps {
	buildings: BuildingEntity[];
	selectedId?: string;
	onSelect: (id: string) => void;
	onOpenDialog: (
		type: DialogType,
		mode: DialogMode,
		data?: DialogData
	) => void;
	onDelete: (id: string, name: string) => void;
}

export function InfrastructureSidebar({
	buildings,
	selectedId,
	onSelect,
	onOpenDialog,
	onDelete,
}: SidebarProps) {
	return (
		<aside className="hidden md:flex w-64 flex-col border-r bg-card/50">
			<div className="p-4 border-b h-14 flex items-center">
				<h2 className="text-lg font-semibold flex items-center gap-2">
					<Building className="w-5 h-5 text-primary" />
					<span>Infrastructure</span>
				</h2>
			</div>
			<div className="flex-1 overflow-y-auto p-4 space-y-4">
				<div className="space-y-1">
					<h4 className="mb-2 px-2 text-xs font-semibold tracking-tight text-muted-foreground">
						BUILDINGS
					</h4>
					{buildings.map(building => (
						<div
							key={building.id}
							onClick={() => onSelect(building.id)}
							className={cn(
								"group flex items-center justify-between rounded-md px-2 py-1.5 text-sm font-medium transition-colors cursor-pointer",
								selectedId === building.id
									? "bg-primary/10 text-primary hover:bg-primary/20"
									: "text-muted-foreground hover:bg-muted hover:text-foreground"
							)}>
							<span className="truncate">{building.name}</span>

							<div className="flex opacity-0 group-hover:opacity-100 transition-opacity gap-1">
								<Button
									variant="ghost"
									size="icon-sm"
									className="h-6 w-6"
									onClick={e => {
										e.stopPropagation();
										onOpenDialog(
											"building",
											"edit",
											building
										);
									}}>
									<Edit2 className="h-3 w-3" />
								</Button>

								<Button
									variant="ghost"
									size="icon-sm"
									className="h-6 w-6 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/40"
									onClick={e => {
										e.stopPropagation();
										onDelete(building.id, building.name);
									}}>
									<Trash2 className="h-3 w-3" />
								</Button>
							</div>
						</div>
					))}
				</div>

				<DashedButton
					onClick={() => onOpenDialog("building", "create")}
					className="w-full justify-start gap-2">
					<Plus className="h-4 w-4" />
					Add Building
				</DashedButton>
			</div>
		</aside>
	);
}
