import type { PaneState } from "$lib/paneforge.svelte.js";
import type { DragState } from "../types.js";

type CursorState =
	| "horizontal"
	| "horizontal-max"
	| "horizontal-min"
	| "vertical"
	| "vertical-max"
	| "vertical-min";

/* Global cursor state */
let currentState: CursorState | null = null;

/* Global cursor element */
let element: HTMLStyleElement | null = null;

/**
 * Returns the cursor style for a given cursor state.
 */
export function getCursorStyle(state: CursorState): string {
	switch (state) {
		case "horizontal":
			return "ew-resize";
		case "horizontal-max":
			return "w-resize";
		case "horizontal-min":
			return "e-resize";
		case "vertical":
			return "ns-resize";
		case "vertical-max":
			return "n-resize";
		case "vertical-min":
			return "s-resize";
	}
}

/**
 * Resets the global cursor style to the default.
 */
export function resetGlobalCursorStyle() {
	if (element === null) return;

	document.head.removeChild(element);

	currentState = null;
	element = null;
}

/**
 * Sets the global cursor style to the given state.
 */
export function setGlobalCursorStyle(state: CursorState, doc: Document) {
	if (currentState === state) return;

	currentState = state;

	const style = getCursorStyle(state);

	if (element === null) {
		element = doc.createElement("style");
		doc.head.appendChild(element);
	}

	element.innerHTML = `*{cursor: ${style}!important;}`;
}

/**
 * Computes the flexbox style for a pane given its layout and drag state.
 */
export function computePaneFlexBoxStyle({
	defaultSize,
	dragState,
	layout,
	panesArray,
	paneIndex,
	precision = 3,
}: {
	defaultSize: number | undefined;
	layout: number[];
	dragState: DragState | null;
	panesArray: PaneState[];
	paneIndex: number;
	precision?: number;
}): Record<string, unknown> {
	const size = layout[paneIndex];

	let flexGrow;
	if (size == null) {
		// Initial render (before panes have registered themselves)
		// To support server rendering, fallback to default size
		flexGrow = defaultSize ?? "1";
	} else if (panesArray.length === 1) {
		//  Single pane group should always fill full width/height
		flexGrow = "1";
	} else {
		flexGrow = size.toPrecision(precision);
	}

	return {
		flexBasis: 0,
		flexGrow,
		flexShrink: 1,
		// Without this, pane sizes may be unintentionally overridden by their content
		overflow: "hidden",
		// Disable pointer events inside of a pane during resize
		// This avoid edge cases like nested iframes
		pointerEvents: dragState !== null ? "none" : undefined,
	};
}
