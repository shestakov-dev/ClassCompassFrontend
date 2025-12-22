import { defineConfig } from "orval";

export default defineConfig({
	classCompassBackend: {
		input: {
			target: "https://api.classcompass.shestakov.app/api-json",
		},
		output: {
			mode: "tags-split",
			target: "./src/api/generated/endpoints",
			schemas: "./src/api/generated/models",
			client: "react-query",
			prettier: true,
			baseUrl: {
				getBaseUrlFromSpecification: true,
				index: 1,
			},
			override: {
				mutator: {
					path: "./src/api/mutators/custom-instance.ts",
					name: "customInstance",
				},
			},
		},
	},
});
