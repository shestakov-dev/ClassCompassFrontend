import {
	Link,
	useRouter,
	type ErrorComponentProps,
} from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Home, ArrowLeft, TriangleAlert } from "lucide-react";
import { GeneralError } from "@/components/general-error";
import { AuthError } from "@/components/auth-error";
import { isAxiosError } from "axios";

export default function ErrorPage({ error }: ErrorComponentProps) {
	const router = useRouter();

	if (isAxiosError(error) && [401, 403].includes(error.response?.status ?? 0)) {
		return <AuthError error={error} />;
	}

	let errorMessage = "An unexpected error has occurred.";
	let errorTitle = "Unknown Error";

	if (error instanceof Error) {
		errorTitle = "Error";
		errorMessage = error.message;
	} else if (typeof error === "string") {
		errorTitle = "Error";
		errorMessage = error;
	}

	return (
		<GeneralError
			title={errorTitle}
			message={errorMessage}
			icon={TriangleAlert}>
			<Button
				variant="outline"
				onClick={() => router.history.back()}>
				<ArrowLeft className="mr-2 h-4 w-4" />
				Go Back
			</Button>
			<Button
				asChild
				variant="default">
				<Link to="/">
					<Home className="mr-2 h-4 w-4" />
					Go Home
				</Link>
			</Button>
		</GeneralError>
	);
}
