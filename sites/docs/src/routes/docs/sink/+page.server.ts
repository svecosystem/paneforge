import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async (event) => {
	const layout = event.cookies.get("paneforge:layout");

	let defaultLayout: number[] | undefined = undefined;
	if (layout) {
		defaultLayout = JSON.parse(layout);
	}

	return {
		defaultLayout,
	};
};
