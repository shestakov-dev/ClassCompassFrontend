import { useRouteError, isRouteErrorResponse } from "react-router";

export default function ErrorPage() {
	const error = useRouteError();

	if (isRouteErrorResponse(error)) {
		return (
			<div>
				<h1>Error {error.status}</h1>
				<p>{error.data}</p>
			</div>
		);
	}

	return <h1>Unexpected Error</h1>;
}
