import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle2, Info } from "lucide-react";
import type { OryToastProps } from "@ory/elements-react";

export function createSettingsToast(flowHint?: string) {
	return function SettingsToast({ message }: OryToastProps) {
		// Override the toast message for onboarding flow
		if (flowHint === "onboarding") {
			return (
				<Alert className="mb-4 border-green-500 bg-green-50 dark:bg-green-950">
					<CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
					<AlertDescription className="text-green-800 dark:text-green-200">
						Welcome to ClassCompass! Please set credentials for your
						profile to get started.
					</AlertDescription>
				</Alert>
			);
		}

		// Default toast rendering for other messages
		const variant = message.type === "error" ? "destructive" : "default";

		const icon =
			message.type === "success" ? (
				<CheckCircle2 className="h-4 w-4" />
			) : (
				<Info className="h-4 w-4" />
			);

		return (
			<Alert variant={variant} className="mb-4">
				{icon}
				<AlertDescription>{message.text}</AlertDescription>
			</Alert>
		);
	};
}
