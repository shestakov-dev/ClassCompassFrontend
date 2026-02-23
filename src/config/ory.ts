import type { OryClientConfiguration } from "@ory/elements-react";
import { API_URL, KRATOS_URL } from "./urls";
import { kratosFetch } from "@/lib/kratos-fetch";

export const oryConfig: OryClientConfiguration = {
	sdk: {
		url: KRATOS_URL,
		options: {
			fetchApi: kratosFetch,
		},
	},
	project: {
		name: "ClassCompass",
		enabled_locales: ["en"],
		translations: [],
		default_locale: "en",
		default_redirect_url: "/",
		locale_behavior: "force_default",
		registration_enabled: false,
		verification_enabled: false,
		recovery_enabled: true,
		error_ui_url: "/error",
		login_ui_url: "/login",
		settings_ui_url: "/settings",
		registration_ui_url: "/register",
		verification_ui_url: "/verification",
		recovery_ui_url: "/recovery",
		favicon_dark_url: `${API_URL}/assets/favicon/favicon-32x32.png`,
		favicon_light_url: `${API_URL}/assets/favicon/favicon-32x32.png`,
		logo_dark_url: `${API_URL}/assets/images/ClassCompassLogo.png`,
		logo_light_url: `${API_URL}/assets/images/ClassCompassLogo.png`,
	},
};
