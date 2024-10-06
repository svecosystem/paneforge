export async function load(event) {
	let layout = event.cookies.get("PaneForge:layout");
	if (layout) {
		layout = JSON.parse(layout);
	}

	return {
		layout,
	};
}
