export function load({ cookies }) {
	let layout = cookies.get("PaneForge:layout");
	if (layout) {
		layout = JSON.parse(layout);
	}

	return {
		layout,
	};
}
