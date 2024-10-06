import { getDoc } from "$lib/utils/docs.js";

export async function load() {
	const { component, title, metadata } = await getDoc("index");
	return {
		component,
		title,
		metadata,
	};
}
