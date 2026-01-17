import "@ory/elements-react/theme/styles.css";
import "@/styles/theme.css";

import { Login } from "@ory/elements-react/theme";
import { useLoginFlow } from "@/hooks/use-login-flow";
import { oryConfig } from "@/config/ory";

export function LoginPage() {
	const flow = useLoginFlow();

	if (!flow) {
		return (
			<div className="min-h-screen flex items-center justify-center bg-background">
				<div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
			</div>
		);
	}

	return (
		<main className="flex-1 flex items-center justify-center bg-background p-4">
			<div className="w-full max-w-md">
				<div className="ory-elements">
					<Login
						flow={flow}
						config={oryConfig}
						components={{
							Card: {},
						}}
					/>
				</div>
			</div>
		</main>
	);
}
