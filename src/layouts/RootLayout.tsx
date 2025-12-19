import { Outlet, useNavigation } from "react-router";
import { Navbar } from "@/components/navbar";
import { useLoading } from "@/context/loading-context";
import { useEffect } from "react";

export default function RootLayout() {
	const navigation = useNavigation();
	const { setIsLoading } = useLoading();

	useEffect(() => {
		if (navigation.state === "loading") {
			setIsLoading(true);

			return () => setIsLoading(false);
		}
	}, [navigation.state, setIsLoading]);

	return (
		<div className="relative h-dvh flex flex-col bg-background text-foreground font-sans antialiased overflow-hidden">
			<Navbar />

			<main className="flex-1">
				<div className="h-full w-full overflow-y-auto scroll-smooth">
					<Outlet />
				</div>
			</main>
		</div>
	);
}
