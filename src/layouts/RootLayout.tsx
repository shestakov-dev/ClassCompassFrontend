import { Outlet, useNavigation } from "react-router";
import NavigationBar from "../components/navigation/NavigationBar";
import LoadingSpinner from "../components/common/LoadingSpinner";

export const RootLayout = () => {
	const navigation = useNavigation();
	const isLoading = navigation.state === "loading";

	return (
		<div className="flex flex-col min-h-screen">
			{isLoading && <LoadingSpinner />}
			<NavigationBar />

			<main className="grow p-4">
				<Outlet />
			</main>
		</div>
	);
};
