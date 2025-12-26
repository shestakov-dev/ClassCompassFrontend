import { GeneralError } from "@/components/general-error";
import { Button } from "@/components/ui/button";
import { RotateCcw, ShieldAlert } from "lucide-react";
import { getErrorMessage } from "@/lib/error-parsing";

export function AuthError({ error }: { error: unknown }) {
	const message = getErrorMessage(error);

	return (
		<GeneralError
			title="Authentication Failed"
			message={message}
			icon={ShieldAlert}>
			<Button onClick={() => window.location.reload()}>
				<RotateCcw className="mr-2 h-4 w-4" />
				Retry
			</Button>
		</GeneralError>
	);
}
