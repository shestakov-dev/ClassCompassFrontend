import { Outlet, useNavigation } from "react-router";
import { Navbar } from "@/components/navbar";
import { MainLoader } from "@/components/ui/main-loader";
import { useAuth } from "@/context/auth-context";

export default function RootLayout() {
	const navigation = useNavigation();
	const { isLoading: isAuthLoading } = useAuth();
	const isLoading = navigation.state === "loading" || isAuthLoading;

	return (
		<div className="h-dvh flex flex-col bg-background text-foreground font-sans antialiased overflow-hidden">
			<Navbar />

			<main className="flex-1 overflow-y-auto scroll-smooth">
				{isLoading ? (
					<div className="flex h-full w-full items-center justify-center">
						<MainLoader />
					</div>
				) : (
					<Outlet />
				)}
			</main>
		</div>
	);
}
