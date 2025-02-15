---
title: PaneGroup
description: A container for panes or nested pane groups.
section: Components
---

<script>
	import { PropField, Collapsible } from '@svecodocs/kit';
</script>

The `PaneGroup` component wraps a collection of panes or nested `PaneGroup`s and is used to initialize and manage the layout of the panes.

## Props

<PropField name="autoSaveId" type="string | null" default="null">
The id to use when storing the layout of the panes in local storage. If provided, the layout will be saved to local storage when it changes. If not provided, the layout will not be saved.
</PropField>

<PropField name="direction" type="'horizontal' | 'vertical'" required>

The direction of the panes in the group. If set to `'horizontal'`, the panes will be arranged side by side. If set to `'vertical'`, the panes will be arranged one on top of the other.

</PropField>

<PropField name="keyboardResizeBy" type="number | null" default="null">
The amount of space to add to the pane group when the keyboard resize event is triggered. If not provided, the default value is used.
</PropField>

<PropField name="onLayoutChange" type="(layout: number[]) => void | null" default="null">
A callback that is called when the layout of the panes in the group changes. The layout is an array of numbers representing the size of each pane in pixels.
</PropField>

<PropField name="storage" type="PaneGroupStorage">
	The storage object to use for saving the layout of the panes in the group.
	<Collapsible title="methods">
		<PropField name="getItem" type="(name: string) => string | null">
			Retrieves the item from storage.
		</PropField>
		<PropField name="setItem" type="(name: string, value: string) => void">
			Sets the item to storage.
		</PropField>
	</Collapsible>
</PropField>

<PropField name="ref" type="HTMLElement | null">

The underlying DOM element of the pane group. You can `bind` to this prop to get a reference to the element.

</PropField>

<PropField name="this" type="typeof PaneGroup">

Imperative API for the pane group. `bind` to this prop to get access to methods for controlling the pane group.

<Collapsible title="methods">
	<PropField name="getLayout" type="() => number[]">
		Gets the layout of the pane group.
	</PropField>
	<PropField name="setLayout" type="(newLayout: number[]) => void">
		Sets the layout of the pane group.
	</PropField>
	<PropField name="getId" type="() => string">
		Gets the ID of the pane group.
	</PropField>
</Collapsible>
</PropField>

## Persisted Layouts/Storage

When the `PaneGroup` component is provided with an `autoSaveId` prop, it will automatically save the layout of the panes to local storage. If you want to use a different storage mechanism, you can provide a `storage` prop with a custom storage object that implements the `PaneGroupStorage` interface.

```ts
export type PaneGroupStorage = {
	/** Retrieves the item from storage */
	getItem(name: string): string | null;
	/** Sets the item to storage */
	setItem(name: string, value: string): void;
};
```

## Data Attributes

The following data attributes are available for the `PaneGroup` component:

```ts
export type PaneGroupAttributes = {
	/** Applied to every pane group element. */
	"data-pane-group": "";
	/** The direction of the pane group. */
	"data-direction": "horizontal" | "vertical";
	/** The ID of the pane group. */
	"data-pane-group-id": string;
};
```
