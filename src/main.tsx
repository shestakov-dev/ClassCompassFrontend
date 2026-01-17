import "@/styles/index.css";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "@tanstack/react-router";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { queryClient } from "@/lib/query-client";
import { ThemeProvider } from "@/context/theme-context";
import { Toaster } from "@/components/ui/sonner";
import { SessionProvider } from "@/context/session-context";
import { SchoolProvider } from "@/context/school-context";
import { TooltipProvider } from "@/components/ui/tooltip";
import { getSession } from "@/services/kratos";
import { router } from "@/router";

getSession().then(session => {
	createRoot(document.getElementById("root")!).render(
		<StrictMode>
			<ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
				<QueryClientProvider client={queryClient}>
					<SessionProvider initialSession={session}>
						<SchoolProvider>
							<TooltipProvider>
								<RouterProvider
									router={router}
									context={{ session }}
								/>
							</TooltipProvider>
						</SchoolProvider>
					</SessionProvider>

					<Toaster />

					<ReactQueryDevtools initialIsOpen={false} />
				</QueryClientProvider>
			</ThemeProvider>
		</StrictMode>
	);
});
