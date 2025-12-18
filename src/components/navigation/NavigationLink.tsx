import { NavLink, type NavLinkProps } from "react-router";

export const NavigationLink = (props: NavLinkProps) => {
	return (
		<NavLink
			{...props}
			className={({ isActive }) =>
				`relative text-lg font-medium text-gallery-100 transition-colors duration-300 hover:text-shamrock-400 
				after:absolute after:-bottom-1 after:left-0 after:h-0.5 after:w-full after:bg-shamrock-400 
				after:origin-center after:scale-x-0 after:transition-transform after:duration-300 hover:after:scale-x-100
				${
					isActive
						? "text-shamrock-600 after:bg-shamrock-600 hover:text-shamrock-600 after:scale-x-100"
						: ""
				}`
			}
		/>
	);
};
