import {
	useRouteError,
	isRouteErrorResponse,
	Link,
	useNavigate,
} from "react-router";
import { Button } from "@/components/ui/button";
import { Home, ArrowLeft, TriangleAlert } from "lucide-react";
import { GeneralError } from "@/components/general-error";

export default function ErrorPage() {
	const error = useRouteError();
	const navigate = useNavigate();

	let errorMessage = "An unexpected error has occurred.";
	let errorTitle = "Unknown Error";

	if (isRouteErrorResponse(error)) {
		errorTitle = `${error.status}`;
		errorMessage = error.statusText || error.data?.message;

		if (error.status === 404) {
			errorTitle = "404";
			errorMessage = "Sorry, the page you are looking for does not exist.";
		}
	} else if (error instanceof Error) {
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
				onClick={() => navigate(-1)}>
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
