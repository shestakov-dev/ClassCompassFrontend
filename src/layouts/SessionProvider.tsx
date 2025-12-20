import { AuthProvider } from "@/context/auth-context";
import { Outlet } from "react-router";

export default function SessionProvider() {
	return (
		<AuthProvider>
			<Outlet />
		</AuthProvider>
	);
}
