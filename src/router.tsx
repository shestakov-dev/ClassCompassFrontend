import { createBrowserRouter } from "react-router";
import HomePage from "@/pages/HomePage";
import RootLayout from "@/layouts/RootLayout";
import ErrorPage from "@/pages/ErrorPage";

export const router = createBrowserRouter([
	{
		path: "/",
		element: <RootLayout />,
		errorElement: <ErrorPage />,
		children: [
			{
				index: true,
				element: <HomePage />,
			},
		],
	},
]);
