import { useEffect, useEffectEvent } from "react";
import { format, parseISO, set } from "date-fns";
import { useForm } from "@tanstack/react-form";
import { z } from "zod";

import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldLabel, FieldError } from "@/components/ui/field";
import { Combobox } from "@/components/ui/combobox";
import { Edit, Trash2 } from "lucide-react";
import type {
	UpdateLessonDto,
	LessonEntity,
	ClassEntity,
	SubjectEntity,
	TeacherEntity,
	BuildingEntity,
	RoomEntity,
	DailyScheduleEntity,
} from "@/api/generated/models";
import {
	Day,
	ALL_DAYS,
	type CreateLessonFormData,
	LessonWeek,
} from "@/types/schedule";
import { WeekBadge } from "@/components/schedule/week-badge";

const lessonSchema = z.object({
	day: z.string().min(1, "Day is required"),
	classId: z.string().min(1, "Class is required"),
	subjectId: z.string().min(1, "Subject is required"),
	teacherId: z.string().optional(),
	roomId: z.string().min(1, "Room is required"),
	startTime: z.string().min(1, "Start time is required"),
	endTime: z.string().min(1, "End time is required"),
	lessonWeek: z.string().min(1, "Lesson week is required"),
});

interface CreateLessonDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onSubmit: (data: CreateLessonFormData) => void;
	isLoading: boolean;
	defaultValues?: Partial<CreateLessonFormData>;
	options: {
		classes?: ClassEntity[];
		subjects?: SubjectEntity[];
		teachers?: TeacherEntity[];
		buildings?: BuildingEntity[];
		dailySchedules?: DailyScheduleEntity[];
	};
}

export function CreateLessonDialog({
	open,
	onOpenChange,
	onSubmit,
	isLoading,
	defaultValues,
	options,
}: CreateLessonDialogProps) {
	const form = useForm({
		defaultValues: {
			day: defaultValues?.day ?? "",
			classId: defaultValues?.classId ?? "",
			subjectId: defaultValues?.subjectId ?? "",
			teacherId: defaultValues?.teacherId ?? "",
			roomId: defaultValues?.roomId ?? "",
			startTime: "",
			endTime: "",
			lessonWeek: LessonWeek.every as LessonWeek,
		},
		onSubmit: async ({ value }) => {
			const [startHours, startMinutes] = value.startTime
				.split(":")
				.map(Number);
			const [endHours, endMinutes] = value.endTime.split(":").map(Number);

			const dateTimeStart = set(new Date(0), {
				hours: startHours,
				minutes: startMinutes,
			}).toISOString();
			const dateTimeEnd = set(new Date(0), {
				hours: endHours,
				minutes: endMinutes,
			}).toISOString();

			onSubmit({
				day: value.day as Day,
				classId: value.classId,
				subjectId: value.subjectId,
				teacherId: value.teacherId,
				roomId: value.roomId,
				startTime: dateTimeStart,
				endTime: dateTimeEnd,
				lessonWeek: value.lessonWeek as LessonWeek,
			});
		},
	});

	const syncFormData = useEffectEvent(() => {
		form.reset();
		if (defaultValues) {
			if (defaultValues.day) {
				form.setFieldValue("day", defaultValues.day);
			}

			if (defaultValues.classId) {
				form.setFieldValue("classId", defaultValues.classId);
			}

			if (defaultValues.subjectId) {
				form.setFieldValue("subjectId", defaultValues.subjectId);
			}

			if (defaultValues.teacherId) {
				form.setFieldValue("teacherId", defaultValues.teacherId);
			}

			if (defaultValues.roomId) {
				form.setFieldValue("roomId", defaultValues.roomId);
			}
		}
	});

	useEffect(() => {
		if (open) {
			syncFormData();
		}
	}, [open, defaultValues]);

	const rooms: RoomEntity[] =
		options.buildings?.flatMap(
			building =>
				building.floors?.flatMap(floor => floor.rooms ?? []) ?? []
		) ?? [];

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle>Create New Lesson</DialogTitle>

					<DialogDescription>
						Add a new lesson to the schedule.
					</DialogDescription>
				</DialogHeader>

				<form
					onSubmit={e => {
						e.preventDefault();
						e.stopPropagation();

						form.handleSubmit();
					}}
					className="space-y-4">
					<form.Field
						name="day"
						validators={{
							onChange: ({ value }) => {
								const result =
									lessonSchema.shape.day.safeParse(value);

								return result.success
									? undefined
									: {
											message:
												result.error.issues[0].message,
										};
							},
						}}
						children={field => (
							<Field>
								<FieldLabel
									htmlFor={field.name}
									className="after:content-['*'] after:ml-0.5 after:text-destructive">
									Day of Week
								</FieldLabel>
								<Combobox
									items={ALL_DAYS.map(day => ({
										value: day,
										label:
											day.charAt(0).toUpperCase() +
											day.slice(1),
									}))}
									value={field.state.value}
									onChange={val =>
										field.handleChange(val as Day)
									}
									placeholder="Select day"
									searchPlaceholder="Search days..."
								/>
								<FieldError errors={field.state.meta.errors} />
							</Field>
						)}
					/>

					<form.Field
						name="classId"
						validators={{
							onChange: ({ value }) => {
								const result =
									lessonSchema.shape.classId.safeParse(value);

								return result.success
									? undefined
									: {
											message:
												result.error.issues[0].message,
										};
							},
						}}
						children={field => (
							<Field>
								<FieldLabel
									htmlFor={field.name}
									className="after:content-['*'] after:ml-0.5 after:text-destructive">
									Class
								</FieldLabel>
								<Combobox
									items={(options.classes ?? []).map(
										classItem => ({
											value: classItem.id,
											label: classItem.name,
										})
									)}
									value={field.state.value}
									onChange={val => field.handleChange(val)}
									placeholder="Select class"
									searchPlaceholder="Search classes..."
								/>
								<FieldError errors={field.state.meta.errors} />
							</Field>
						)}
					/>

					<form.Field
						name="subjectId"
						validators={{
							onChange: ({ value }) => {
								const result =
									lessonSchema.shape.subjectId.safeParse(
										value
									);

								return result.success
									? undefined
									: {
											message:
												result.error.issues[0].message,
										};
							},
						}}
						children={field => (
							<Field>
								<FieldLabel
									htmlFor={field.name}
									className="after:content-['*'] after:ml-0.5 after:text-destructive">
									Subject
								</FieldLabel>
								<Combobox
									items={(options.subjects ?? []).map(
										subject => ({
											value: subject.id,
											label: subject.name,
										})
									)}
									value={field.state.value}
									onChange={val => field.handleChange(val)}
									placeholder="Select subject"
									searchPlaceholder="Search subjects..."
								/>
								<FieldError errors={field.state.meta.errors} />
							</Field>
						)}
					/>

					<form.Field
						name="teacherId"
						children={field => (
							<Field>
								<FieldLabel htmlFor={field.name}>
									Teacher
								</FieldLabel>
								<Combobox
									items={(options.teachers ?? []).map(
										teacher => ({
											value: teacher.id,
											label: `${teacher.user?.firstName ?? ""} ${teacher.user?.lastName ?? ""}`.trim(),
											secondaryLabel: teacher.user?.email,
										})
									)}
									value={field.state.value}
									onChange={val => field.handleChange(val)}
									placeholder="Select teacher"
									searchPlaceholder="Search teachers..."
								/>
							</Field>
						)}
					/>

					<form.Field
						name="roomId"
						validators={{
							onChange: ({ value }) => {
								const result =
									lessonSchema.shape.roomId.safeParse(value);

								return result.success
									? undefined
									: {
											message:
												result.error.issues[0].message,
										};
							},
						}}
						children={field => (
							<Field>
								<FieldLabel
									htmlFor={field.name}
									className="after:content-['*'] after:ml-0.5 after:text-destructive">
									Room
								</FieldLabel>
								<Combobox
									items={rooms.map(room => ({
										value: room.id,
										label: room.name,
										secondaryLabel:
											room.floor?.building?.name,
									}))}
									value={field.state.value}
									onChange={val => field.handleChange(val)}
									placeholder="Select room"
									searchPlaceholder="Search rooms..."
								/>
								<FieldError errors={field.state.meta.errors} />
							</Field>
						)}
					/>

					<div className="grid grid-cols-2 gap-4">
						<form.Field
							name="startTime"
							validators={{
								onChange: ({ value }) => {
									const result =
										lessonSchema.shape.startTime.safeParse(
											value
										);

									return result.success
										? undefined
										: {
												message:
													result.error.issues[0]
														.message,
											};
								},
							}}
							children={field => (
								<Field>
									<FieldLabel
										htmlFor={field.name}
										className="after:content-['*'] after:ml-0.5 after:text-destructive">
										Start Time
									</FieldLabel>
									<Input
										id={field.name}
										type="time"
										value={field.state.value}
										onBlur={field.handleBlur}
										onChange={e =>
											field.handleChange(e.target.value)
										}
									/>
									<FieldError
										errors={field.state.meta.errors}
									/>
								</Field>
							)}
						/>
						<form.Field
							name="endTime"
							validators={{
								onChange: ({ value }) => {
									const result =
										lessonSchema.shape.endTime.safeParse(
											value
										);

									return result.success
										? undefined
										: {
												message:
													result.error.issues[0]
														.message,
											};
								},
							}}
							children={field => (
								<Field>
									<FieldLabel
										htmlFor={field.name}
										className="after:content-['*'] after:ml-0.5 after:text-destructive">
										End Time
									</FieldLabel>
									<Input
										id={field.name}
										type="time"
										value={field.state.value}
										onBlur={field.handleBlur}
										onChange={e =>
											field.handleChange(e.target.value)
										}
									/>
									<FieldError
										errors={field.state.meta.errors}
									/>
								</Field>
							)}
						/>
					</div>

					<form.Field
						name="lessonWeek"
						validators={{
							onChange: ({ value }) => {
								const result =
									lessonSchema.shape.lessonWeek.safeParse(
										value
									);

								return result.success
									? undefined
									: {
											message:
												result.error.issues[0].message,
										};
							},
						}}
						children={field => (
							<Field>
								<FieldLabel
									htmlFor={field.name}
									className="after:content-['*'] after:ml-0.5 after:text-destructive">
									Lesson Week
								</FieldLabel>
								<Combobox
									items={[
										{
											value: LessonWeek.every,
											label: "All Weeks",
										},
										{
											value: LessonWeek.odd,
											label: "Odd Weeks",
										},
										{
											value: LessonWeek.even,
											label: "Even Weeks",
										},
									]}
									value={field.state.value}
									onChange={val =>
										field.handleChange(val as LessonWeek)
									}
									placeholder="Select lesson week"
									searchPlaceholder="Search lesson week..."
								/>
								<FieldError errors={field.state.meta.errors} />
							</Field>
						)}
					/>

					<DialogFooter>
						<Button
							type="button"
							variant="outline"
							onClick={() => onOpenChange(false)}
							disabled={isLoading}>
							Cancel
						</Button>

						<form.Subscribe
							selector={state => [
								state.canSubmit,
								state.isSubmitting,
							]}
							children={([canSubmit, isSubmitting]) => (
								<Button
									type="submit"
									disabled={
										!canSubmit || isSubmitting || isLoading
									}>
									{isLoading || isSubmitting
										? "Creating..."
										: "Create Lesson"}
								</Button>
							)}
						/>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}

interface EditLessonDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onSubmit: (
		data: UpdateLessonDto & { day?: string; classId?: string }
	) => void;
	isLoading: boolean;
	lesson: LessonEntity | null;
	options: {
		classes?: ClassEntity[];
		subjects?: SubjectEntity[];
		teachers?: TeacherEntity[];
		buildings?: BuildingEntity[];
	};
}

export function EditLessonDialog({
	open,
	onOpenChange,
	onSubmit,
	isLoading,
	lesson,
	options,
}: EditLessonDialogProps) {
	const form = useForm({
		defaultValues: {
			day: "",
			classId: "",
			subjectId: "",
			teacherId: "",
			roomId: "",
			startTime: "",
			endTime: "",
			lessonWeek: LessonWeek.every as LessonWeek,
		},
		onSubmit: async ({ value }) => {
			const [startHours, startMinutes] = value.startTime
				.split(":")
				.map(Number);
			const [endHours, endMinutes] = value.endTime.split(":").map(Number);

			const updatedStartTime = set(new Date(0), {
				hours: startHours,
				minutes: startMinutes,
			}).toISOString();

			const updatedEndTime = set(new Date(0), {
				hours: endHours,
				minutes: endMinutes,
			}).toISOString();

			onSubmit({
				day: value.day as Day,
				classId: value.classId,
				subjectId: value.subjectId,
				teacherId: value.teacherId,
				roomId: value.roomId,
				startTime: updatedStartTime,
				endTime: updatedEndTime,
				lessonWeek: value.lessonWeek as LessonWeek,
			});
		},
	});

	const syncFormData = useEffectEvent(() => {
		if (lesson) {
			form.setFieldValue("day", lesson.dailySchedule?.day ?? "");
			form.setFieldValue("classId", lesson.dailySchedule?.classId ?? "");
			form.setFieldValue("subjectId", lesson.subjectId ?? "");
			form.setFieldValue("teacherId", lesson.teacherId ?? "");
			form.setFieldValue("roomId", lesson.roomId ?? "");

			form.setFieldValue(
				"startTime",
				lesson.startTime
					? format(parseISO(lesson.startTime), "HH:mm")
					: ""
			);

			form.setFieldValue(
				"endTime",
				lesson.endTime ? format(parseISO(lesson.endTime), "HH:mm") : ""
			);

			form.setFieldValue(
				"lessonWeek",
				lesson.lessonWeek ?? LessonWeek.every
			);
		}
	});

	useEffect(() => {
		if (open) {
			syncFormData();
		}
	}, [open, lesson]);

	const rooms: RoomEntity[] =
		options.buildings?.flatMap(
			building =>
				building.floors?.flatMap(floor => floor.rooms ?? []) ?? []
		) ?? [];

	if (!lesson) return null;

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle>Edit Lesson</DialogTitle>

					<DialogDescription>
						Update the details for the lesson.
					</DialogDescription>
				</DialogHeader>

				<form
					onSubmit={e => {
						e.preventDefault();
						e.stopPropagation();

						form.handleSubmit();
					}}
					className="space-y-4">
					<form.Field
						name="day"
						validators={{
							onChange: ({ value }) => {
								const result =
									lessonSchema.shape.day.safeParse(value);

								return result.success
									? undefined
									: {
											message:
												result.error.issues[0].message,
										};
							},
						}}
						children={field => (
							<Field>
								<FieldLabel
									htmlFor={field.name}
									className="after:content-['*'] after:ml-0.5 after:text-destructive">
									Day of Week
								</FieldLabel>
								<Combobox
									items={ALL_DAYS.map(day => ({
										value: day,
										label:
											day.charAt(0).toUpperCase() +
											day.slice(1),
									}))}
									value={field.state.value}
									onChange={val =>
										field.handleChange(val as Day)
									}
									placeholder="Select day"
									searchPlaceholder="Search days..."
								/>
								<FieldError errors={field.state.meta.errors} />
							</Field>
						)}
					/>

					<form.Field
						name="classId"
						validators={{
							onChange: ({ value }) => {
								const result =
									lessonSchema.shape.classId.safeParse(value);

								return result.success
									? undefined
									: {
											message:
												result.error.issues[0].message,
										};
							},
						}}
						children={field => (
							<Field>
								<FieldLabel
									htmlFor={field.name}
									className="after:content-['*'] after:ml-0.5 after:text-destructive">
									Class
								</FieldLabel>
								<Combobox
									items={(options.classes ?? []).map(
										classItem => ({
											value: classItem.id,
											label: classItem.name,
										})
									)}
									value={field.state.value}
									onChange={val => field.handleChange(val)}
									placeholder="Select class"
									searchPlaceholder="Search classes..."
								/>
								<FieldError errors={field.state.meta.errors} />
							</Field>
						)}
					/>

					<form.Field
						name="subjectId"
						validators={{
							onChange: ({ value }) => {
								const result =
									lessonSchema.shape.subjectId.safeParse(
										value
									);

								return result.success
									? undefined
									: {
											message:
												result.error.issues[0].message,
										};
							},
						}}
						children={field => (
							<Field>
								<FieldLabel
									htmlFor={field.name}
									className="after:content-['*'] after:ml-0.5 after:text-destructive">
									Subject
								</FieldLabel>
								<Combobox
									items={(options.subjects ?? []).map(
										subject => ({
											value: subject.id,
											label: subject.name,
										})
									)}
									value={field.state.value}
									onChange={val => field.handleChange(val)}
									placeholder="Select subject"
									searchPlaceholder="Search subjects..."
								/>
								<FieldError errors={field.state.meta.errors} />
							</Field>
						)}
					/>

					<form.Field
						name="teacherId"
						children={field => (
							<Field>
								<FieldLabel htmlFor={field.name}>
									Teacher
								</FieldLabel>
								<Combobox
									items={(options.teachers ?? []).map(
										teacher => ({
											value: teacher.id,
											label: `${teacher.user?.firstName ?? ""} ${teacher.user?.lastName ?? ""}`.trim(),
											secondaryLabel: teacher.user?.email,
										})
									)}
									value={field.state.value}
									onChange={val => field.handleChange(val)}
									placeholder="Select teacher"
									searchPlaceholder="Search teachers..."
								/>
							</Field>
						)}
					/>

					<form.Field
						name="roomId"
						validators={{
							onChange: ({ value }) => {
								const result =
									lessonSchema.shape.roomId.safeParse(value);

								return result.success
									? undefined
									: {
											message:
												result.error.issues[0].message,
										};
							},
						}}
						children={field => (
							<Field>
								<FieldLabel
									htmlFor={field.name}
									className="after:content-['*'] after:ml-0.5 after:text-destructive">
									Room
								</FieldLabel>
								<Combobox
									items={rooms.map(room => ({
										value: room.id,
										label: room.name,
										secondaryLabel:
											room.floor?.building?.name,
									}))}
									value={field.state.value}
									onChange={val => field.handleChange(val)}
									placeholder="Select room"
									searchPlaceholder="Search rooms..."
								/>
								<FieldError errors={field.state.meta.errors} />
							</Field>
						)}
					/>

					<div className="grid grid-cols-2 gap-4">
						<form.Field
							name="startTime"
							validators={{
								onChange: ({ value }) => {
									const result =
										lessonSchema.shape.startTime.safeParse(
											value
										);

									return result.success
										? undefined
										: {
												message:
													result.error.issues[0]
														.message,
											};
								},
							}}
							children={field => (
								<Field>
									<FieldLabel
										htmlFor={field.name}
										className="after:content-['*'] after:ml-0.5 after:text-destructive">
										Start Time
									</FieldLabel>
									<Input
										id={field.name}
										type="time"
										value={field.state.value}
										onBlur={field.handleBlur}
										onChange={e =>
											field.handleChange(e.target.value)
										}
									/>
									<FieldError
										errors={field.state.meta.errors}
									/>
								</Field>
							)}
						/>
						<form.Field
							name="endTime"
							validators={{
								onChange: ({ value }) => {
									const result =
										lessonSchema.shape.endTime.safeParse(
											value
										);

									return result.success
										? undefined
										: {
												message:
													result.error.issues[0]
														.message,
											};
								},
							}}
							children={field => (
								<Field>
									<FieldLabel
										htmlFor={field.name}
										className="after:content-['*'] after:ml-0.5 after:text-destructive">
										End Time
									</FieldLabel>
									<Input
										id={field.name}
										type="time"
										value={field.state.value}
										onBlur={field.handleBlur}
										onChange={e =>
											field.handleChange(e.target.value)
										}
									/>
									<FieldError
										errors={field.state.meta.errors}
									/>
								</Field>
							)}
						/>
					</div>

					<form.Field
						name="lessonWeek"
						validators={{
							onChange: ({ value }) => {
								const result =
									lessonSchema.shape.lessonWeek.safeParse(
										value
									);

								return result.success
									? undefined
									: {
											message:
												result.error.issues[0].message,
										};
							},
						}}
						children={field => (
							<Field>
								<FieldLabel
									htmlFor={field.name}
									className="after:content-['*'] after:ml-0.5 after:text-destructive">
									Lesson Week
								</FieldLabel>
								<Combobox
									items={[
										{
											value: LessonWeek.every,
											label: "All Weeks",
										},
										{
											value: LessonWeek.odd,
											label: "Odd Weeks",
										},
										{
											value: LessonWeek.even,
											label: "Even Weeks",
										},
									]}
									value={field.state.value}
									onChange={val =>
										field.handleChange(val as LessonWeek)
									}
									placeholder="Select lesson week"
									searchPlaceholder="Search lesson week..."
								/>
								<FieldError errors={field.state.meta.errors} />
							</Field>
						)}
					/>

					<DialogFooter>
						<Button
							type="button"
							variant="outline"
							onClick={() => onOpenChange(false)}
							disabled={isLoading}>
							Cancel
						</Button>

						<form.Subscribe
							selector={state => [
								state.canSubmit,
								state.isSubmitting,
							]}
							children={([canSubmit, isSubmitting]) => (
								<Button
									type="submit"
									disabled={
										!canSubmit || isSubmitting || isLoading
									}>
									{isLoading || isSubmitting
										? "Saving..."
										: "Save Changes"}
								</Button>
							)}
						/>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}

interface DeleteLessonDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onConfirm: () => void;
	isLoading: boolean;
	lesson: LessonEntity | null;
}

export function DeleteLessonDialog({
	open,
	onOpenChange,
	onConfirm,
	isLoading,
	lesson,
}: DeleteLessonDialogProps) {
	if (!lesson) {
		return null;
	}

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Delete Lesson</DialogTitle>

					<DialogDescription>
						Are you sure you want to delete this lesson? This action
						cannot be undone.
					</DialogDescription>
				</DialogHeader>

				<div className="py-4">
					<dl className="space-y-3 text-sm">
						<div className="flex justify-between py-2 border-b">
							<dt className="text-muted-foreground">Subject:</dt>
							<dd className="font-medium">
								{lesson.subject?.name}
							</dd>
						</div>

						<div className="flex justify-between py-2 border-b">
							<dt className="text-muted-foreground">Teacher:</dt>
							<dd className="font-medium">
								{lesson.teacher?.user?.firstName}{" "}
								{lesson.teacher?.user?.lastName}
							</dd>
						</div>

						<div className="flex justify-between py-2 border-b">
							<dt className="text-muted-foreground">Room:</dt>
							<dd className="font-medium">{lesson.room?.name}</dd>
						</div>

						<div className="flex justify-between py-2 border-b">
							<dt className="text-muted-foreground">Day:</dt>
							<dd className="font-medium capitalize">
								{lesson.dailySchedule?.day}
							</dd>
						</div>

						<div className="flex justify-between py-2 border-b">
							<dt className="text-muted-foreground">Class:</dt>
							<dd className="font-medium">
								{lesson.dailySchedule?.class?.name}
							</dd>
						</div>

						<div className="flex justify-between py-2 border-b">
							<dt className="text-muted-foreground">Time:</dt>
							<dd className="font-medium">
								{format(parseISO(lesson.startTime), "HH:mm")} -{" "}
								{format(parseISO(lesson.endTime), "HH:mm")}
							</dd>
						</div>

						<div className="flex justify-between py-2 border-b">
							<dt className="text-muted-foreground">Week:</dt>
							<dd className="font-medium capitalize">
								{lesson.lessonWeek === "every"
									? "All Weeks"
									: lesson.lessonWeek === "odd"
										? "Odd Weeks"
										: "Even Weeks"}
							</dd>
						</div>
					</dl>
				</div>

				<DialogFooter>
					<Button
						type="button"
						variant="outline"
						onClick={() => onOpenChange(false)}
						disabled={isLoading}>
						Cancel
					</Button>

					<Button
						type="button"
						variant="destructive"
						onClick={onConfirm}
						disabled={isLoading}>
						{isLoading ? "Deleting..." : "Delete Lesson"}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}

interface LessonDetailsDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	lesson: LessonEntity | null;
	onEdit?: (lesson: LessonEntity) => void;
	onDelete?: (lesson: LessonEntity) => void;
}

export function LessonDetailsDialog({
	open,
	onOpenChange,
	lesson,
	onEdit,
	onDelete,
}: LessonDetailsDialogProps) {
	if (!lesson) {
		return null;
	}

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>{lesson.subject?.name}</DialogTitle>

					<DialogDescription className="flex items-center gap-2 flex-wrap">
						<span>
							{lesson.dailySchedule?.day &&
								lesson.dailySchedule.day
									.charAt(0)
									.toUpperCase() +
									lesson.dailySchedule.day.slice(1)}{" "}
							•{" "}
							{lesson.startTime &&
								format(
									parseISO(lesson.startTime),
									"HH:mm"
								)}{" "}
							-{" "}
							{lesson.endTime &&
								format(parseISO(lesson.endTime), "HH:mm")}
						</span>

						<WeekBadge lessonWeek={lesson.lessonWeek} />
					</DialogDescription>
				</DialogHeader>

				<dl className="space-y-3 py-2 text-sm">
					<div className="flex justify-between py-2 border-b">
						<dt className="text-muted-foreground">Class</dt>
						<dd className="font-medium">
							{lesson.dailySchedule?.class?.name ?? "N/A"}
						</dd>
					</div>

					<div className="flex justify-between py-2 border-b">
						<dt className="text-muted-foreground">Room</dt>
						<dd className="font-medium">
							{lesson.room?.name ?? "N/A"}
						</dd>
					</div>

					<div className="flex justify-between py-2 border-b">
						<dt className="text-muted-foreground">Teacher</dt>
						<dd className="font-medium">
							{lesson.teacher?.user
								? `${lesson.teacher.user.firstName} ${lesson.teacher.user.lastName}`
								: "N/A"}
						</dd>
					</div>
				</dl>

				{(onEdit || onDelete) && (
					<div className="flex gap-2 pt-2">
						{onEdit && (
							<Button
								variant="outline"
								onClick={() => {
									onOpenChange(false);
									onEdit(lesson);
								}}
								className="flex flex-1 align-center justify-center gap-2">
								<Edit className="h-4 w-4" />
								Edit
							</Button>
						)}

						{onDelete && (
							<Button
								variant="destructive"
								onClick={() => {
									onOpenChange(false);
									onDelete(lesson);
								}}
								className="flex flex-1 align-center justify-center gap-2">
								<Trash2 className="h-4 w-4" />
								Delete
							</Button>
						)}
					</div>
				)}
			</DialogContent>
		</Dialog>
	);
}
