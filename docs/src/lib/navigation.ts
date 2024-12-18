import { defineNavigation } from "@svecodocs/kit";
import ChalkboardTeacher from "phosphor-svelte/lib/ChalkboardTeacher";
import RocketLaunch from "phosphor-svelte/lib/RocketLaunch";
import Tag from "phosphor-svelte/lib/Tag";
import Palette from "phosphor-svelte/lib/Palette";
import { getAllDocs } from "./utils.js";

const allDocs = getAllDocs();

const components = allDocs
	.filter((doc) => doc.section === "Components")
	.map((doc) => ({
		title: doc.title,
		href: `/docs/${doc.slug}`,
	}));

const examples = allDocs
	.filter((doc) => doc.section === "Examples")
	.map((doc) => ({
		title: doc.title,
		href: `/docs/${doc.slug}`,
	}));

export const navigation = defineNavigation({
	anchors: [
		{
			title: "Introduction",
			href: "/docs",
			icon: ChalkboardTeacher,
		},
		{
			title: "Getting Started",
			href: "/docs/getting-started",
			icon: RocketLaunch,
		},
		{
			title: "Styling",
			href: "/docs/styling",
			icon: Palette,
		},
		{
			title: "Releases",
			href: "https://github.com/svecosystem/svecodocs/releases",
			icon: Tag,
		},
	],
	sections: [
		{
			title: "Components",
			items: components,
		},
		{
			title: "Examples",
			items: examples,
		},
	],
});
