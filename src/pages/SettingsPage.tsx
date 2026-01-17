import "@ory/elements-react/theme/styles.css";
import "@/styles/ory.css";

import { SessionProvider } from "@ory/elements-react/client";
import { Settings } from "@ory/elements-react/theme";
import type { OryFlowComponentOverrides } from "@ory/elements-react";
import { useSettingsFlow } from "@/hooks/use-settings-flow";
import { oryConfig } from "@/config/ory";
import { createSettingsToast } from "@/components/common/settings-toast";
import { useSearch } from "@tanstack/react-router";
import { useMemo } from "react";

export function SettingsPage() {
	const flow = useSettingsFlow();
	const searchParams = useSearch({ from: "/settings" });

	const components: OryFlowComponentOverrides = useMemo(
		() => ({
			Message: {
				Toast: createSettingsToast(searchParams.flow_hint),
			},
		}),
		[searchParams.flow_hint]
	);

	if (!flow) {
		return (
			<div className="min-h-screen flex items-center justify-center bg-background">
				<div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
			</div>
		);
	}

	return (
		<main className="flex-1 flex items-center justify-center bg-background p-4">
			<div className="w-full max-w-2xl">
				<div className="ory-elements">
					<SessionProvider>
						<Settings
							flow={flow}
							config={oryConfig}
							components={components}
						/>
					</SessionProvider>
				</div>
			</div>
		</main>
	);
}
