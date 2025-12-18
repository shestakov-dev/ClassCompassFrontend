import { Link, type LinkProps } from "react-router";

export const NavigationButton = (props: LinkProps) => {
	return (
		<Link
			{...props}
			className="px-4 py-2 rounded-md text-lg font-medium border-2 border-shamrock-600 transition-colors duration-300 text-shamrock-500 hover:bg-shamrock-600 hover:text-white"
		/>
	);
};
