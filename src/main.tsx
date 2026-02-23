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
import { IntlProvider } from "react-intl";
import en from "@/locales/en.json";
import { getSession } from "@/services/kratos";
import { router } from "@/router";
import { AXIOS_INSTANCE } from "./api/mutators/custom-instance";

AXIOS_INSTANCE.defaults.baseURL = import.meta.env.VITE_API_URL;

getSession().then(session => {
	createRoot(document.getElementById("root")!).render(
		<StrictMode>
			<ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
				<IntlProvider locale="en" defaultLocale="en" messages={en}>
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
				</IntlProvider>
			</ThemeProvider>
		</StrictMode>
	);
});
