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
		<div className="min-h-dvh flex flex-col bg-background text-foreground font-sans antialiased">
			<Navbar />

			<main className="flex-1 flex flex-col">
				<Outlet />
			</main>
		</div>
	);
}
