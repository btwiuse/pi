import { fileURLToPath, URL } from "node:url";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";

export default defineConfig({
	plugins: [tailwindcss()],
	resolve: {
		alias: {
			"@earendil-works/pi-tui/browser": fileURLToPath(new URL("../../tui/src/browser.ts", import.meta.url)),
		},
	},
});
