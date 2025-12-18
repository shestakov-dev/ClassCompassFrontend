import { useState, useEffect } from "react";
import "./LoadingSpinner.css";

const LoadingSpinner = () => {
	const [dots, setDots] = useState(".");

	useEffect(() => {
		const dotsInterval = setInterval(() => {
			setDots(prevDots => (prevDots.length < 3 ? prevDots + "." : "."));
		}, 300);

		return () => clearInterval(dotsInterval);
	}, []);

	return (
		<div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-3 bg-mine-shaft-950/50 w-full h-full">
			<img
				src="/images/ClassCompassLogo.png"
				alt="Loading..."
				id="loading-spinner"
				className="h-32 w-32"
			/>
			<p className="text-4xl font-bold text-gallery-100">
				Loading<span className="w-8 inline-block text-left">{dots}</span>
			</p>
		</div>
	);
};

export default LoadingSpinner;
