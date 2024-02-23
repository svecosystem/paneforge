export const siteConfig = {
	name: "Pane Forge",
	url: "https://paneforge.com",
	description: "Resizable pane components for Svelte and SvelteKit.",
	links: {
		x: "https://x.com/huntabyte",
		github: "https://github.com/huntabyte/paneforge",
	},
	author: "Huntabyte",
	keywords:
		"Svelte resizable panels,svelte panels,svelte panes,paneforge,svelte pane,svelte pane forge",
	ogImage: {
		url: "https://paneforge.com/og.png",
		width: "1200",
		height: "630",
	},
	license: {
		name: "MIT",
		url: "https://github.com/huntabyte/paneforge/blob/main/LICENSE",
	},
};

export type SiteConfig = typeof siteConfig;
