// src/pages/OryErrorPage.tsx
import { useKratosError } from "@/hooks/use-kratos-error";
import { GeneralError } from "@/components/common/general-error";
import { Button } from "@/components/ui/button";
import { Link, useSearch } from "@tanstack/react-router";
import { Home, TriangleAlert } from "lucide-react";
import { Error } from "@ory/elements-react/theme";
import { oryConfig } from "@/config/ory";

export function OryErrorPage() {
	const error = useKratosError();
	const searchParams = useSearch({ strict: false });

	// Default state if no ID is present
	if (!searchParams.id) {
		return (
			<GeneralError
				title="No Error ID Found"
				message="This page was reached without an error reference. Please go back to the home page."
				icon={TriangleAlert}>
				<Button asChild variant="default">
					<Link to="/">
						<Home className="mr-2 h-4 w-4" />
						Go Home
					</Link>
				</Button>
			</GeneralError>
		);
	}

	// Loading state
	if (!error) {
		return (
			<div className="min-h-screen flex items-center justify-center bg-background">
				<div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
			</div>
		);
	}

	return (
		<div className="flex-1 flex items-center justify-center bg-background p-4">
			<div className="w-full max-w-md">
				<div className="ory-elements">
					<Error config={oryConfig} error={error} />
				</div>
			</div>
		</div>
	);
}
