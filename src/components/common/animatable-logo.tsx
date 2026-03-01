import { LOGO_URL } from "@/config/urls";
import { useEffect, useState } from "react";

interface LogoProps {
	animate?: boolean;
	className?: string;
}

export function AnimatableLogo({ animate = false, className = "" }: LogoProps) {
	const [isVisible, setIsVisible] = useState(!animate);
	const [cacheBuster, setCacheBuster] = useState("");

	useEffect(() => {
		if (animate) {
			// Wait 50ms after the component mounts before showing
			// the logo to ensure the animation is visible.
			// Generate a random cache buster to force reload the image
			const timer = setTimeout(() => {
				const randomId = Math.random().toString(36).substring(2, 9);
				setCacheBuster(`?v=${randomId}`);

				setIsVisible(true);
			}, 50);

			return () => clearTimeout(timer);
		}
	}, [animate]);

	const logoUrl = animate ? `${LOGO_URL}${cacheBuster}#cc-logo` : LOGO_URL;

	const wrapperClass = `relative flex items-center justify-center transition-opacity duration-500 ${
		isVisible ? "opacity-100" : "opacity-0"
	} ${className}`;

	return (
		<div className={wrapperClass}>
			{/* Glow effect */}
			{animate && (
				<div className="absolute inset-0 animate-pulse rounded-full bg-primary/20 blur-xl" />
			)}

			{/* Render the image only when static, or when the animated version has its cache buster ready */}
			{(!animate || cacheBuster !== "") && (
				<img
					key={cacheBuster}
					src={logoUrl}
					alt="ClassCompass Logo"
					className="relative h-full w-full object-contain"
				/>
			)}
		</div>
	);
}
