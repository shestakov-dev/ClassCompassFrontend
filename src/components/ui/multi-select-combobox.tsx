"use client";

import { useId, useState } from "react";

import { CheckIcon, ChevronsUpDownIcon, XIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from "@/components/ui/command";
import { Label } from "@/components/ui/label";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";

export interface ComboboxItem {
	value: string;
	label: string;
}

interface MultiSelectComboboxProps {
	items: ComboboxItem[];
	selectedValues: string[];
	onChange: (values: string[]) => void;
	placeholder?: string;
	label?: string;
	searchPlaceholder?: string;
	emptyMessage?: string;
	maxShownItems?: number;
	id?: string;
}

export function MultiSelectCombobox({
	items,
	selectedValues,
	onChange,
	placeholder = "Select items",
	label,
	searchPlaceholder = "Search...",
	emptyMessage = "No items found.",
	maxShownItems = 2,
	id: providedId,
}: MultiSelectComboboxProps) {
	const generatedId = useId();
	const id = providedId ?? generatedId;
	const [open, setOpen] = useState(false);
	const [expanded, setExpanded] = useState(false);

	const toggleSelection = (value: string) => {
		const newValues = selectedValues.includes(value)
			? selectedValues.filter(v => v !== value)
			: [...selectedValues, value];
		onChange(newValues);
	};

	const removeSelection = (value: string) => {
		onChange(selectedValues.filter(v => v !== value));
	};

	const visibleItems = expanded
		? selectedValues
		: selectedValues.slice(0, maxShownItems);
	const hiddenCount = selectedValues.length - visibleItems.length;

	return (
		<div className="w-full space-y-2">
			{label && <Label htmlFor={id}>{label}</Label>}
			<Popover open={open} onOpenChange={setOpen}>
				<PopoverTrigger asChild>
					<Button
						id={id}
						variant="outline"
						role="combobox"
						aria-expanded={open}
						className="h-auto min-h-8 w-full justify-between hover:bg-transparent">
						<div
							className={`flex flex-wrap items-center gap-1 pr-2.5 ${expanded ? "max-h-32 overflow-y-auto" : "max-h-none"}`}>
							{selectedValues.length > 0 ? (
								<>
									{visibleItems.map(val => {
										const item = items.find(
											c => c.value === val
										);

										return item ? (
											<Badge
												key={val}
												variant="outline"
												className="rounded-sm">
												{item.label}
												<Button
													variant="ghost"
													size="icon"
													className="size-4"
													onClick={e => {
														e.stopPropagation();
														removeSelection(val);
													}}
													asChild>
													<span>
														<XIcon className="size-3" />
													</span>
												</Button>
											</Badge>
										) : null;
									})}
									{hiddenCount > 0 || expanded ? (
										<Badge
											variant="outline"
											onClick={e => {
												e.stopPropagation();
												setExpanded(prev => !prev);
											}}
											className="rounded-sm cursor-pointer">
											{expanded
												? "Show Less"
												: `+${hiddenCount} more`}
										</Badge>
									) : null}
								</>
							) : (
								<span className="text-muted-foreground">
									{placeholder}
								</span>
							)}
						</div>
						<ChevronsUpDownIcon
							className="text-muted-foreground/80 shrink-0"
							aria-hidden="true"
						/>
					</Button>
				</PopoverTrigger>
				<PopoverContent className="w-(--radix-popper-anchor-width) p-0">
					<Command>
						<CommandInput placeholder={searchPlaceholder} />
						<CommandList>
							<CommandEmpty>{emptyMessage}</CommandEmpty>
							<CommandGroup>
								{items.map(item => (
									<CommandItem
										key={item.value}
										value={item.value}
										onSelect={() =>
											toggleSelection(item.value)
										}>
										<span className="truncate">
											{item.label}
										</span>
										{selectedValues.includes(
											item.value
										) && (
											<CheckIcon
												size={16}
												className="ml-auto"
											/>
										)}
									</CommandItem>
								))}
							</CommandGroup>
						</CommandList>
					</Command>
				</PopoverContent>
			</Popover>
		</div>
	);
}
