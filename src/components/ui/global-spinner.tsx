export function GlobalSpinner() {
	return (
		<div className="flex flex-col items-center justify-center gap-12">
			<div className="relative flex items-center justify-center">
				{/* Ping effect behind the logo */}
				<div className="absolute inset-0 animate-ping rounded-full bg-primary/20 opacity-75 duration-1000" />

				<img
					src="https://api.classcompass.shestakov.app/assets/images/ClassCompassLogo.png"
					alt="ClassCompass Logo"
					className="relative h-32 w-32 animate-wiggle"
				/>
			</div>
			<p className="text-4xl font-bold text-muted-foreground animate-pulse">
				Loading...
			</p>
		</div>
	);
}
