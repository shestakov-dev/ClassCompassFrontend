import { createBrowserRouter, redirect } from "react-router";
import HomePage from "@/pages/HomePage";
import RootLayout from "@/layouts/RootLayout";
import ErrorPage from "@/pages/ErrorPage";
import { rootLoader } from "@/loaders/root-loader";
import SessionLayout from "@/layouts/SessionLayout";
import { createLogoutFlow } from "@/services/kratos";
import {
	LOGIN_URL,
	ROUTE_LOGIN,
	ROUTE_LOGOUT,
	ROUTE_HOME,
	ROUTE_SCHEDULE,
} from "@/config/urls";
import SchedulePage from "./pages/SchedulePage";
import { scheduleLoader } from "./loaders/schedule-loader";

export const router = createBrowserRouter([
	{
		element: <SessionLayout />,
		errorElement: <ErrorPage />,
		loader: rootLoader,
		children: [
			{
				element: <RootLayout />,
				children: [
					{
						index: true,
						element: <HomePage />,
					},
					{
						path: ROUTE_SCHEDULE,
						element: <SchedulePage />,
						loader: scheduleLoader,
					},
				],
			},
			{
				path: ROUTE_LOGIN,
				loader: ({ request }) => {
					const url = new URL(request.url);

					// If we have a return_to parameter, preserve it
					const returnTo = url.searchParams.get("return_to") ?? window.location.href;

					const target = new URL(LOGIN_URL);

					target.searchParams.set("return_to", returnTo);

					throw redirect(target.toString());
				},
			},
			{
				path: ROUTE_LOGOUT,
				loader: async ({ request }) => {
					const url = new URL(request.url);

					const returnTo = url.searchParams.get("return_to") ?? window.location.href;

					const flow = await createLogoutFlow();

					if (flow?.logout_url) {
						const target = new URL(flow.logout_url);

						target.searchParams.set("return_to", returnTo);

						throw redirect(target.toString());
					} else {
						// If no logout URL is provided, redirect to home
						throw redirect(ROUTE_HOME);
					}
				},
			},
		],
	},
]);
