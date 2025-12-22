import { SessionProvider } from "@/context/session-context";
import { Outlet } from "react-router";

export default function SessionLayout() {
	return (
		<SessionProvider>
			<Outlet />
		</SessionProvider>
	);
}
