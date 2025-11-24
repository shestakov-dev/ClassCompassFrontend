import { createBrowserRouter } from "react-router";
import { RootLayout } from "./layouts/RootLayout";
import IndexPage from "./routes";
import ErrorPage from "./routes/error";

export const router = createBrowserRouter([
	{
		element: <RootLayout />,
		errorElement: <ErrorPage />,
		children: [
			{
				index: true,
				element: <IndexPage />,
			},
		],
	},
]);
