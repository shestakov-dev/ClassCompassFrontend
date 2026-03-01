import { Link } from "@tanstack/react-router";
import {
	CalendarRange,
	ShieldCheck,
	SlidersHorizontal,
	ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { type ReactNode } from "react";
import { AnimatableLogo } from "@/components/common/animatable-logo";

export default function HomePage() {
	return (
		<div className="flex flex-col min-h-full">
			{/* Hero Section */}
			<section className="relative flex min-h-full flex-col items-center justify-center space-y-10 py-24 text-center md:py-32">
				<div className="container flex flex-col items-center gap-6 px-4">
					<div className="relative flex h-48 w-48 items-center justify-center">
						<AnimatableLogo animate={true} className="h-32 w-32" />
					</div>

					{/* Title & Description */}
					<div className="space-y-4 max-w-3xl">
						<h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
							Welcome to{" "}
							<span className="text-primary">ClassCompass</span>
						</h1>
						<p className="mx-auto max-w-175 text-muted-foreground md:text-xl">
							Navigate your academic journey with precision.
						</p>
					</div>

					{/* CTA Buttons */}
					<div className="flex flex-col gap-4 sm:flex-row">
						<Link to="/login">
							<Button size="lg" className="px-8 text-lg h-12">
								Get Started
							</Button>
						</Link>
					</div>
				</div>

				{/* Scroll Indicator */}
				<div className="animate-bounce">
					<ChevronDown className="h-10 w-10 text-muted-foreground/50" />
					<span className="sr-only">Scroll down</span>
				</div>
			</section>

			{/* Features Section */}
			<section className="container mx-auto px-4 py-12 md:py-24 lg:py-32">
				<div className="grid grid-cols-1 gap-6 md:grid-cols-3">
					<FeatureCard
						icon={
							<ShieldCheck className="h-10 w-10 text-primary" />
						}
						title="Zero-Trust Architecture"
						description="Built on the Ory ecosystem (Kratos, Keto, Oathkeeper) for modern, secure identity management and granular access control."
					/>

					<FeatureCard
						icon={
							<CalendarRange className="h-10 w-10 text-primary" />
						}
						title="Digital Timetables"
						description="Access organized schedules for students and faculty. Clearly view planned classes, assigned rooms, and time slots at a glance."
					/>

					<FeatureCard
						icon={
							<SlidersHorizontal className="h-10 w-10 text-primary" />
						}
						title="Advanced Filtering"
						description="Find exactly what you need by filtering schedules by time ranges, specific rooms, subjects, or various other criteria."
					/>
				</div>
			</section>
		</div>
	);
}

function FeatureCard({
	icon,
	title,
	description,
}: {
	icon: ReactNode;
	title: string;
	description: string;
}) {
	return (
		<Card className="border-border/50 bg-card/50 transition-all hover:bg-card hover:border-primary/50">
			<CardHeader>
				<div className="mb-4 inline-block rounded-lg bg-primary/10 p-3 w-fit">
					{icon}
				</div>
				<CardTitle className="text-xl">{title}</CardTitle>
			</CardHeader>
			<CardContent>
				<p className="text-muted-foreground">{description}</p>
			</CardContent>
		</Card>
	);
}
