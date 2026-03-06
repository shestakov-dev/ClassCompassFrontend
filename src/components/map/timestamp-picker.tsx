import { useCallback, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { DatePicker } from "@/components/common/date-picker";
import { Clock } from "lucide-react";
import { format, set } from "date-fns";
import { UTCDate } from "@date-fns/utc";
import { cn } from "@/lib/utils";
import { useForm } from "@tanstack/react-form";

interface TimestampPickerProps {
	timestamp: Date;
	onTimestampChange: (timestamp: Date) => void;
	className?: string;
}

export function TimestampPicker({
	timestamp,
	onTimestampChange,
	className,
}: TimestampPickerProps) {
	const form = useForm({
		defaultValues: {
			time: format(new UTCDate(timestamp), "HH:mm"),
		},
	});

	// Sync form value when timestamp changes externally (e.g. reset)
	useEffect(() => {
		form.setFieldValue("time", format(new UTCDate(timestamp), "HH:mm"));
	}, [timestamp, form]);

	const applyTime = useCallback(
		(value: string) => {
			const [hours, minutes] = value.split(":").map(Number);

			if (isNaN(hours) || isNaN(minutes)) {
				return;
			}

			const clamp = (value: number, max: number) =>
				Math.max(0, Math.min(value, max));

			onTimestampChange(
				set(new UTCDate(timestamp), {
					hours: clamp(hours, 23),
					minutes: clamp(minutes, 59),
					seconds: 0,
					milliseconds: 0,
				})
			);
		},
		[timestamp, onTimestampChange]
	);

	const handleDateChange = (date: Date) => {
		const utc = new UTCDate(timestamp);

		onTimestampChange(
			set(
				new UTCDate(
					date.getFullYear(),
					date.getMonth(),
					date.getDate()
				),
				{
					hours: utc.getHours(),
					minutes: utc.getMinutes(),
					seconds: 0,
					milliseconds: 0,
				}
			)
		);
	};

	return (
		<div className={cn("flex justify-start gap-2", className)}>
			<DatePicker
				date={timestamp}
				setDate={handleDateChange}
				size="sm"
				variant="ghost"
				className="h-8 w-auto shrink-0 px-2"
			/>

			<form.Field
				name="time"
				validators={{
					onChangeAsyncDebounceMs: 500,
					onChangeAsync: async ({ value }) => {
						applyTime(value);
					},
				}}
				children={field => (
					<div className="relative shrink-0">
						<Clock className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />

						<Input
							type="time"
							value={field.state.value}
							onChange={e => field.handleChange(e.target.value)}
							className="h-8 w-auto shrink-0 text-sm font-medium pl-7"
						/>
					</div>
				)}
			/>
		</div>
	);
}
