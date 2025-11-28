import { createBrowserRouter } from "react-router";
import { RootLayout } from "./layouts/RootLayout";
import IndexPage from "./routes";
import ErrorPage from "./routes/error";
import { AboutPage } from "./routes/about";

export const router = createBrowserRouter([
	{
		element: <RootLayout />,
		errorElement: <ErrorPage />,
		children: [
			{
				index: true,
				element: <IndexPage />,
			},
			{
				path: "about",
				element: <AboutPage />,
			},
		],
	},
]);
