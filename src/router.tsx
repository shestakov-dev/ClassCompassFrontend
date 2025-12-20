import { createBrowserRouter, redirect } from "react-router";
import HomePage from "@/pages/HomePage";
import RootLayout from "@/layouts/RootLayout";
import ErrorPage from "@/pages/ErrorPage";
import { sessionMiddleware } from "@/middleware/auth";
import { rootLoader } from "@/loaders/root-loader";
import SessionProvider from "@/layouts/SessionProvider";

export const router = createBrowserRouter([
	{
		element: <SessionProvider />,
		errorElement: <ErrorPage />,
		middleware: [sessionMiddleware],
		loader: rootLoader,
		children: [
			{
				element: <RootLayout />,
				children: [
					{
						index: true,
						element: <HomePage />,
					},
				],
			},
			{
				path: "/login",
				loader: () => {
					throw redirect("https://classcompass.shestakov.app/login");
				},
			},
		],
	},
]);
