import { useEffect, useEffectEvent, useState, type FormEvent } from "react";
import { format, parseISO, set } from "date-fns";
import { toast } from "sonner";
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
import { Label } from "@/components/ui/label";
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
	const [selectedDay, setSelectedDay] = useState<Day | "">(
		defaultValues?.day ?? ""
	);
	const [selectedClassId, setSelectedClassId] = useState<string>(
		defaultValues?.classId ?? ""
	);
	const [subjectId, setSubjectId] = useState<string>(
		defaultValues?.subjectId ?? ""
	);
	const [teacherId, setTeacherId] = useState<string>(
		defaultValues?.teacherId ?? ""
	);
	const [roomId, setRoomId] = useState<string>(defaultValues?.roomId ?? "");
	const [startTime, setStartTime] = useState<string>("");
	const [endTime, setEndTime] = useState<string>("");
	const [lessonWeek, setLessonWeek] = useState<LessonWeek>(LessonWeek.every);

	const syncFormData = useEffectEvent(() => {
		setSelectedDay(defaultValues?.day ?? "");
		setSelectedClassId(defaultValues?.classId ?? "");
		setSubjectId(defaultValues?.subjectId ?? "");
		setTeacherId(defaultValues?.teacherId ?? "");
		setRoomId(defaultValues?.roomId ?? "");
		setStartTime("");
		setEndTime("");
		setLessonWeek(LessonWeek.every);
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

	const handleSubmit = (e: FormEvent) => {
		e.preventDefault();

		if (
			!selectedDay ||
			!selectedClassId ||
			!subjectId ||
			!teacherId ||
			!roomId ||
			!startTime ||
			!endTime ||
			!lessonWeek
		) {
			toast.error("Please fill in all required fields");
			return;
		}

		const [startHours, startMinutes] = startTime.split(":").map(Number);
		const [endHours, endMinutes] = endTime.split(":").map(Number);

		const dateTimeStart = set(new Date(0), {
			hours: startHours,
			minutes: startMinutes,
		}).toISOString();
		const dateTimeEnd = set(new Date(0), {
			hours: endHours,
			minutes: endMinutes,
		}).toISOString();

		onSubmit({
			day: selectedDay,
			classId: selectedClassId,
			subjectId,
			teacherId,
			roomId,
			startTime: dateTimeStart,
			endTime: dateTimeEnd,
			lessonWeek,
		});
	};

	const isFormValid =
		selectedDay &&
		selectedClassId &&
		subjectId &&
		teacherId &&
		roomId &&
		startTime &&
		endTime &&
		lessonWeek;

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle>Create New Lesson</DialogTitle>

					<DialogDescription>
						Add a new lesson to the schedule. Fields are pre-filled
						based on current filters but can be changed.
					</DialogDescription>
				</DialogHeader>

				<form onSubmit={handleSubmit} className="space-y-4">
					<div className="space-y-2">
						<Label
							htmlFor="day"
							className="after:content-['*'] after:ml-0.5 after:text-destructive">
							Day of Week
						</Label>
						<Combobox
							items={ALL_DAYS.map(day => ({
								value: day,
								label:
									day.charAt(0).toUpperCase() + day.slice(1),
							}))}
							value={selectedDay}
							onChange={value => setSelectedDay(value as Day)}
							placeholder="Select day"
							searchPlaceholder="Search days..."
						/>
					</div>

					<div className="space-y-2">
						<Label
							htmlFor="class"
							className="after:content-['*'] after:ml-0.5 after:text-destructive">
							Class
						</Label>
						<Combobox
							items={(options.classes ?? []).map(classItem => ({
								value: classItem.id,
								label: classItem.name,
							}))}
							value={selectedClassId}
							onChange={setSelectedClassId}
							placeholder="Select class"
							searchPlaceholder="Search classes..."
						/>
					</div>

					<div className="space-y-2">
						<Label
							htmlFor="subject"
							className="after:content-['*'] after:ml-0.5 after:text-destructive">
							Subject
						</Label>
						<Combobox
							items={(options.subjects ?? []).map(subject => ({
								value: subject.id,
								label: subject.name,
							}))}
							value={subjectId}
							onChange={setSubjectId}
							placeholder="Select subject"
							searchPlaceholder="Search subjects..."
						/>
					</div>

					<div className="space-y-2">
						<Label htmlFor="teacher">Teacher</Label>
						<Combobox
							items={(options.teachers ?? []).map(teacher => ({
								value: teacher.id,
								label: `${teacher.user?.firstName ?? ""} ${teacher.user?.lastName ?? ""}`.trim(),
								secondaryLabel: teacher.user?.email,
							}))}
							value={teacherId}
							onChange={setTeacherId}
							placeholder="Select teacher"
							searchPlaceholder="Search teachers..."
						/>
					</div>

					<div className="space-y-2">
						<Label
							htmlFor="room"
							className="after:content-['*'] after:ml-0.5 after:text-destructive">
							Room
						</Label>
						<Combobox
							items={rooms.map(room => ({
								value: room.id,
								label: room.name,
								secondaryLabel: room.floor?.building?.name,
							}))}
							value={roomId}
							onChange={setRoomId}
							placeholder="Select room"
							searchPlaceholder="Search rooms..."
						/>
					</div>

					<div className="grid grid-cols-2 gap-4">
						<div className="space-y-2">
							<Label
								htmlFor="startTime"
								className="after:content-['*'] after:ml-0.5 after:text-destructive">
								Start Time
							</Label>
							<Input
								id="startTime"
								type="time"
								value={startTime}
								onChange={e => setStartTime(e.target.value)}
								required
							/>
						</div>

						<div className="space-y-2">
							<Label
								htmlFor="endTime"
								className="after:content-['*'] after:ml-0.5 after:text-destructive">
								End Time
							</Label>
							<Input
								id="endTime"
								type="time"
								value={endTime}
								onChange={e => setEndTime(e.target.value)}
								required
							/>
						</div>
					</div>

					<div className="space-y-2">
						<Label
							htmlFor="lessonWeek"
							className="after:content-['*'] after:ml-0.5 after:text-destructive">
							Lesson Week
						</Label>
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
							value={lessonWeek}
							onChange={value =>
								setLessonWeek(value as LessonWeek)
							}
							placeholder="Select lesson week"
							searchPlaceholder="Search lesson week..."
						/>
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
							type="submit"
							disabled={!isFormValid || isLoading}>
							{isLoading ? "Creating..." : "Create Lesson"}
						</Button>
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
	const [day, setDay] = useState<Day | "">("");
	const [classId, setClassId] = useState<string>("");
	const [subjectId, setSubjectId] = useState<string>("");
	const [teacherId, setTeacherId] = useState<string>("");
	const [roomId, setRoomId] = useState<string>("");
	const [startTime, setStartTime] = useState<string>("");
	const [endTime, setEndTime] = useState<string>("");
	const [lessonWeek, setLessonWeek] = useState<LessonWeek>(LessonWeek.every);

	const syncFormData = useEffectEvent(() => {
		if (lesson) {
			setDay(lesson.dailySchedule?.day ?? "");
			setClassId(lesson.dailySchedule?.classId ?? "");
			setSubjectId(lesson.subjectId ?? "");
			setTeacherId(lesson.teacherId ?? "");
			setRoomId(lesson.roomId ?? "");
			setStartTime(
				lesson.startTime
					? format(parseISO(lesson.startTime), "HH:mm")
					: ""
			);
			setEndTime(
				lesson.endTime ? format(parseISO(lesson.endTime), "HH:mm") : ""
			);
			setLessonWeek(lesson.lessonWeek);
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

	const handleSubmit = (e: FormEvent) => {
		e.preventDefault();

		if (
			!lesson ||
			!day ||
			!classId ||
			!subjectId ||
			!teacherId ||
			!roomId ||
			!startTime ||
			!endTime ||
			!lessonWeek
		) {
			toast.error("Please fill in all required fields");
			return;
		}

		const [startHours, startMinutes] = startTime.split(":").map(Number);
		const [endHours, endMinutes] = endTime.split(":").map(Number);

		const updatedStartTime = set(new Date(0), {
			hours: startHours,
			minutes: startMinutes,
		}).toISOString();

		const updatedEndTime = set(new Date(0), {
			hours: endHours,
			minutes: endMinutes,
		}).toISOString();

		onSubmit({
			day,
			classId,
			subjectId,
			teacherId,
			roomId,
			startTime: updatedStartTime,
			endTime: updatedEndTime,
			lessonWeek,
		});
	};

	const isFormValid =
		day &&
		classId &&
		subjectId &&
		teacherId &&
		roomId &&
		startTime &&
		endTime &&
		lessonWeek;

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

				<form onSubmit={handleSubmit} className="space-y-4">
					<div className="space-y-2">
						<Label
							htmlFor="day"
							className="after:content-['*'] after:ml-0.5 after:text-destructive">
							Day of Week
						</Label>
						<Combobox
							items={ALL_DAYS.map(dayOption => ({
								value: dayOption,
								label:
									dayOption.charAt(0).toUpperCase() +
									dayOption.slice(1),
							}))}
							value={day}
							onChange={value => setDay(value as Day)}
							placeholder="Select day"
							searchPlaceholder="Search days..."
						/>
					</div>

					<div className="space-y-2">
						<Label
							htmlFor="class"
							className="after:content-['*'] after:ml-0.5 after:text-destructive">
							Class
						</Label>
						<Combobox
							items={(options.classes ?? []).map(classItem => ({
								value: classItem.id,
								label: classItem.name,
							}))}
							value={classId}
							onChange={setClassId}
							placeholder="Select class"
							searchPlaceholder="Search classes..."
						/>
					</div>

					<div className="space-y-2">
						<Label
							htmlFor="subject"
							className="after:content-['*'] after:ml-0.5 after:text-destructive">
							Subject
						</Label>
						<Combobox
							items={(options.subjects ?? []).map(subject => ({
								value: subject.id,
								label: subject.name,
							}))}
							value={subjectId}
							onChange={setSubjectId}
							placeholder="Select subject"
							searchPlaceholder="Search subjects..."
						/>
					</div>

					<div className="space-y-2">
						<Label
							htmlFor="teacher"
							className="after:content-['*'] after:ml-0.5 after:text-destructive">
							Teacher
						</Label>
						<Combobox
							items={(options.teachers ?? []).map(teacher => ({
								value: teacher.id,
								label: `${teacher.user?.firstName ?? ""} ${teacher.user?.lastName ?? ""}`.trim(),
								secondaryLabel: teacher.user?.email,
							}))}
							value={teacherId}
							onChange={setTeacherId}
							placeholder="Select teacher"
							searchPlaceholder="Search teachers..."
						/>
					</div>

					<div className="space-y-2">
						<Label
							htmlFor="room"
							className="after:content-['*'] after:ml-0.5 after:text-destructive">
							Room
						</Label>
						<Combobox
							items={rooms.map(room => ({
								value: room.id,
								label: room.name,
								secondaryLabel: room.floor?.building?.name,
							}))}
							value={roomId}
							onChange={setRoomId}
							placeholder="Select room"
							searchPlaceholder="Search rooms..."
						/>
					</div>

					<div className="grid grid-cols-2 gap-4">
						<div className="space-y-2">
							<Label
								htmlFor="startTime"
								className="after:content-['*'] after:ml-0.5 after:text-destructive">
								Start Time
							</Label>
							<Input
								id="startTime"
								type="time"
								value={startTime}
								onChange={e => setStartTime(e.target.value)}
								required
							/>
						</div>
						<div className="space-y-2">
							<Label
								htmlFor="endTime"
								className="after:content-['*'] after:ml-0.5 after:text-destructive">
								End Time
							</Label>
							<Input
								id="endTime"
								type="time"
								value={endTime}
								onChange={e => setEndTime(e.target.value)}
								required
							/>
						</div>
					</div>

					<div className="space-y-2">
						<Label
							htmlFor="lessonWeek"
							className="after:content-['*'] after:ml-0.5 after:text-destructive">
							Lesson Week
						</Label>
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
							value={lessonWeek}
							onChange={value =>
								setLessonWeek(value as LessonWeek)
							}
							placeholder="Select lesson week"
							searchPlaceholder="Search lesson week..."
						/>
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
							type="submit"
							disabled={!isFormValid || isLoading}>
							{isLoading ? "Saving..." : "Save Changes"}
						</Button>
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
