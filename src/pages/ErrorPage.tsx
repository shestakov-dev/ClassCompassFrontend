import {
	useRouteError,
	isRouteErrorResponse,
	Link,
	useNavigate,
} from "react-router";
import { Button } from "@/components/ui/button";
import { TriangleAlert, Home, ArrowLeft } from "lucide-react";

export default function ErrorPage() {
	const error = useRouteError();
	const navigate = useNavigate();

	let errorMessage: string;
	let errorTitle: string;

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
	} else {
		console.error(error);

		errorTitle = "Unknown Error";
		errorMessage = "An unexpected error has occurred.";
	}

	return (
		<div className="h-dvh flex flex-col bg-background text-foreground font-sans antialiased overflow-hidden">
			<main className="flex-1 overflow-y-auto flex flex-col items-center justify-center p-4 text-center">
				<div className="flex flex-col items-center justify-center space-y-6">
					<div className="rounded-full bg-muted p-6">
						<TriangleAlert className="h-12 w-12" />
					</div>
					<div className="space-y-2">
						<h1 className="text-4xl font-bold tracking-tighter sm:text-6xl font-mono slashed-zero">
							{errorTitle}
						</h1>
						<p className="max-w-150 text-muted-foreground md:text-xl/relaxed">
							{errorMessage}
						</p>
					</div>
					<div className="flex gap-4">
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
					</div>
				</div>
			</main>
		</div>
	);
}
