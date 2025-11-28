import { useRouteError, isRouteErrorResponse, Link } from "react-router";

export default function ErrorPage() {
	const error = useRouteError();

	let errorStatus: number;
	let errorStatusText: string;

	if (isRouteErrorResponse(error)) {
		errorStatus = error.status;
		errorStatusText = error.statusText;
	} else {
		errorStatus = 500;
		errorStatusText = "Unexpected Error";
	}

	return (
		<div className="flex flex-col items-center justify-center h-full text-center">
			<h1 className="text-4xl font-bold">{errorStatus}</h1>
			<p className="text-xl">{errorStatusText}</p>
			<Link
				to="/"
				className="mt-4 px-4 py-2 bg-shamrock-600 rounded hover:bg-shamrock-500">
				Go back to Home
			</Link>
		</div>
	);
}
