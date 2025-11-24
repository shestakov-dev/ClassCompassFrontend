import { NavLink, Outlet } from "react-router";

export function RootLayout() {
	return (
		<div className="p-4">
			<nav className="flex gap-4 mb-6">
				<NavLink to="/">Home</NavLink>
				<NavLink to="/app/schools">Schools</NavLink>
			</nav>

			<Outlet />
		</div>
	);
}
