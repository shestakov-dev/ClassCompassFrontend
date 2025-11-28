import { Link } from "react-router";
import { NavigationLink } from "./NavigationLink";
import { NavigationButton } from "./NavigationButton";

interface LinkItem {
	name: string;
	href: string;
}

const NavigationBar = () => {
	// 'user' can be null (not logged in) or an object with role/privileges
	const links: LinkItem[] = [
		{ name: "Home", href: "/" },
		{ name: "About", href: "/about" },
	];

	const buttons: LinkItem[] = [{ name: "Login", href: "/login" }];

	return (
		<nav className="bg-mine-shaft-950 text-gallery-100 px-6 py-3 flex items-center justify-between border-b border-mine-shaft-800">
			{/* Left: Logo + Project name */}
			<Link
				to="/"
				className="group flex flex-row items-center gap-1 sm:gap-3">
				<img
					src="/images/ClassCompassLogo.png"
					alt="Logo"
					className="h-12 w-12 sm:h-16 sm:w-16 transition-transform duration-300 group-hover:scale-110"
				/>
				<span className="relative text-4xl group-hover:text-shamrock-400 transition-colors duration-300 hidden sm:inline font-roboto font-bold text-center after:absolute after:-bottom-1 after:left-0 after:h-0.5 after:w-full after:bg-shamrock-400 after:origin-center after:scale-x-0 after:transition-transform after:duration-300 sm:group-hover:after:scale-x-100">
					ClassCompass
				</span>
			</Link>

			{/* Middle: Links */}
			<div className="flex gap-x-4">
				{links.map(link => (
					<NavigationLink
						key={link.name}
						to={link.href}>
						{link.name}
					</NavigationLink>
				))}
			</div>

			{/* Right: Auth buttons */}
			<div className="flex gap-x-2">
				{buttons.map(button => (
					<NavigationButton
						key={button.name}
						to={button.href}>
						{button.name}
					</NavigationButton>
				))}
			</div>
		</nav>
	);
};

export default NavigationBar;
