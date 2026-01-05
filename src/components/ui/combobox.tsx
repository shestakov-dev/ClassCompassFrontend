"use client";

import { useId, useState } from "react";
import { CheckIcon, ChevronsUpDownIcon } from "lucide-react";

import { cn } from "@/lib/utils";
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
	secondaryLabel?: string;
}

interface ComboboxProps {
	items: ComboboxItem[];
	value?: string;
	onChange: (value: string) => void;
	placeholder?: string;
	label?: string;
	searchPlaceholder?: string;
	emptyMessage?: string;
	id?: string;
	className?: string;
	modal?: boolean;
	size?: React.ComponentProps<typeof Button>["size"];
}

export function Combobox({
	items,
	value,
	onChange,
	placeholder = "Select item...",
	label,
	searchPlaceholder = "Search...",
	emptyMessage = "No item found.",
	id: providedId,
	className,
	modal = false,
	size,
}: ComboboxProps) {
	const generatedId = useId();
	const id = providedId ?? generatedId;
	const [open, setOpen] = useState(false);

	const handleSelect = (currentValue: string) => {
		const matchedItem = items.find(
			item => item.value.toLowerCase() === currentValue.toLowerCase()
		);
		const originalValue = matchedItem ? matchedItem.value : currentValue;
		onChange(originalValue === value ? "" : originalValue);
		setOpen(false);
	};

	const selectedItem = items.find(item => item.value === value);

	return (
		<div className={cn("w-full space-y-2", className)}>
			{label && <Label htmlFor={id}>{label}</Label>}
			<Popover open={open} onOpenChange={setOpen} modal={modal}>
				<PopoverTrigger asChild>
					<Button
						id={id}
						variant="outline"
						role="combobox"
						size={size}
						aria-expanded={open}
						className="w-full justify-between hover:bg-transparent">
						{selectedItem ? (
							<div className="flex items-center gap-2 truncate">
								<span className="truncate">
									{selectedItem.label}
								</span>
								{selectedItem.secondaryLabel && (
									<span className="text-xs text-muted-foreground truncate">
										({selectedItem.secondaryLabel})
									</span>
								)}
							</div>
						) : (
							<span className="text-muted-foreground">
								{placeholder}
							</span>
						)}
						<ChevronsUpDownIcon
							className="ml-2 h-4 w-4 shrink-0 opacity-50"
							aria-hidden="true"
						/>
					</Button>
				</PopoverTrigger>
				<PopoverContent className="w-[--radix-popper-anchor-width] p-0">
					<Command>
						<CommandInput placeholder={searchPlaceholder} />
						<CommandList>
							<CommandEmpty>{emptyMessage}</CommandEmpty>
							<CommandGroup>
								{items.map(item => (
									<CommandItem
										key={item.value}
										value={item.value}
										keywords={[
											item.label,
											item.secondaryLabel,
										].filter(
											(s): s is string =>
												typeof s === "string"
										)}
										onSelect={handleSelect}>
										<div className="flex flex-col">
											<span>{item.label}</span>
											{item.secondaryLabel && (
												<span className="text-xs text-muted-foreground">
													{item.secondaryLabel}
												</span>
											)}
										</div>
										<CheckIcon
											className={cn(
												"ml-auto h-4 w-4",
												value === item.value
													? "opacity-100"
													: "opacity-0"
											)}
										/>
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
