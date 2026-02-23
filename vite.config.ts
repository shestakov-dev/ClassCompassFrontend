import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import tailwindcss from "@tailwindcss/vite";
import path from "path";
import { tanstackRouter } from "@tanstack/router-plugin/vite";

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
	const env = loadEnv(mode, process.cwd());

	const urlBase = env.VITE_BASE_URL ?? "classcompass.shestakov.app";

	if (!env.VITE_BASE_URL) {
		throw new Error(
			"VITE_BASE_URL is not defined in the environment variables."
		);
	}

	return {
		plugins: [
			react(),
			tailwindcss({ optimize: true }),
			tanstackRouter({
				target: "react",
				autoCodeSplitting: true,
			}),
		],
		resolve: {
			alias: {
				"@": path.resolve(__dirname, "./src"),
			},
		},
		server: {
			host: "0.0.0.0",
			port: 5173,
			hmr: {
				host: urlBase,
				path: "/ws",
				protocol: "wss",
				clientPort: 443,
			},
			allowedHosts: [urlBase],
		},
	};
});
