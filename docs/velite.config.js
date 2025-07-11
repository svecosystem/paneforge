import { defineConfig, s } from "velite";

const baseSchema = s.object({
	title: s.string(),
	description: s.string(),
	path: s.path(),
	content: s.markdown(),
	navLabel: s.string().optional(),
	raw: s.raw(),
	toc: s.toc(),
	section: s.enum(["Anchors", "Components", "Examples"]),
});

const docSchema = baseSchema.transform((data) => {
	return {
		...data,
		slug: data.path,
		slugFull: `/${data.path}`,
	};
});

export default defineConfig({
	root: "./src/content",
	collections: {
		docs: {
			name: "Doc",
			pattern: "./**/*.md",
			schema: docSchema,
		},
	},
});
