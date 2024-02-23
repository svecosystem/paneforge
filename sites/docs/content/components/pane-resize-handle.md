---
title: PaneResizeHandle
description: A draggable handle between two panes that allows the user to resize them.
tagline: Components
---

The `PaneResizeHandle` component is used to create a draggable handle between two panes that allows the user to resize them.

## Usage

```svelte {7}
<script lang="ts">
	import { PaneGroup, Pane, PaneResizeHandle } from "svelte-pane";
</script>

<PaneGroup direction="horizontal">
	<Pane defaultSize={50}>Pane 1</Pane>
	<PaneResizeHandle />
	<Pane defaultSize={50}>Pane 2</Pane>
</PaneGroup>
```

## Props

Here are the props available for the `PaneResizeHandle` component:

```ts
export type PaneResizeHandleProps = {
	/**
	 * Whether the resize handle is disabled.
	 *
	 * @defaultValue `false`
	 */
	disabled?: boolean;

	/**
	 * A callback that is called when the resize handle's dragging state changes.
	 */
	onDraggingChange?: (isDragging: boolean) => void;

	/**
	 * The tabIndex of the resize handle.
	 */
	tabIndex?: number;

	/**
	 * The underlying DOM element of the resize handle. You can `bind` to this
	 * prop to get a reference to the element.
	 */
	el?: HTMLElement | null;
} & HTMLAttributes<HTMLDivElement>;
```

## Data Attributes

The following data attributes are available for the `PaneResizeHandle` component:

```ts
export type PaneResizeHandleAttributes = {
	/** The direction of the pane group the handle belongs to. */
	"data-pane-group-direction": "horizontal" | "vertical";
	/** The ID of the pane group the handle belongs to. */
	"data-pane-group-id": string;
	/** Whether the resize handle is active or not. */
	"data-active"?: "pointer" | "keyboard";
	/** Whether the resize handle is enabled or not. */
	"data-enabled"?: boolean;
	/** The ID of the resize handle. */
	"data-pane-resize-handle-id": string;
};
```
