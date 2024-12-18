import { defineSiteConfig } from "@svecodocs/kit";

export const siteConfig = defineSiteConfig({
	name: "Paneforge",
	url: "https://paneforge.com",
	ogImage: {
		url: "https://paneforge.com/og.png",
		height: "630",
		width: "1200",
	},
	description: "Resizable pane components for Svelte and SvelteKit",
	author: "Huntabyte",
	keywords: [
		"svelte resizable",
		"svelte panels",
		"svelte panes",
		"svelte resizable panels",
		"svelte 5 resizable",
		"sveltekit resizable",
		"sveltekit panels",
		"sveltekit panes",
		"sveltekit resizable panels",
		"svelte 5 panel components",
	],
	license: {
		name: "MIT",
		url: "https://github.com/svecosystem/paneforge/blob/main/LICENSE",
	},
	links: {
		x: "https://x.com/huntabyte",
		github: "https://github.com/svecosystem/paneforge",
	},
});
