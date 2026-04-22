import { defineConfig } from "orval";
import dotenv from "dotenv";

dotenv.config();

const apiUrl = process.env.VITE_API_URL;

if (!apiUrl) {
	throw new Error(
		"VITE_API_URL is not defined in the environment variables."
	);
}

export default defineConfig({
	classCompassBackend: {
		input: {
			target: `${apiUrl}/api-json`,
		},
		output: {
			mode: "tags-split",
			target: "./src/api/generated/endpoints",
			schemas: "./src/api/generated/models",
			httpClient: "axios",
			client: "react-query",
			prettier: true,
			override: {
				mutator: {
					path: "./src/api/mutators/custom-instance.ts",
					name: "customInstance",
				},
			},
		},
	},
});
