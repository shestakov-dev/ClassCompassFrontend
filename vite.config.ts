import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import tailwindcss from "@tailwindcss/vite";
import path from "path";
import { tanstackRouter } from "@tanstack/router-plugin/vite";

// https://vite.dev/config/
export default defineConfig({
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
			host: "classcompass.shestakov.app",
			path: "/ws",
			protocol: "wss",
			clientPort: 443,
		},
		allowedHosts: ["classcompass.shestakov.app"],
	},
});
