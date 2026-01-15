import { GeneralError } from "@/components/common/general-error";
import { Button } from "@/components/ui/button";
import { Link, useRouter } from "@tanstack/react-router";
import { ArrowLeft, Home, SearchX } from "lucide-react";

export function NotFoundPage() {
	const router = useRouter();

	return (
		<GeneralError
			title="404"
			message="Sorry, the page you are looking for does not exist."
			icon={SearchX}>
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
