import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "@/index.css";
import { RouterProvider } from "react-router";
import { router } from "@/router";
import { ThemeProvider } from "@/context/theme-context";
import { AuthProvider } from "./context/auth-context";
import { LoadingProvider } from "@/context/loading-context";

createRoot(document.getElementById("root")!).render(
	<StrictMode>
		<ThemeProvider>
			<LoadingProvider>
				<AuthProvider>
					<RouterProvider router={router} />
				</AuthProvider>
			</LoadingProvider>
		</ThemeProvider>
	</StrictMode>
);
