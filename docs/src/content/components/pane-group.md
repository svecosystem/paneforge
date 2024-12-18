---
title: PaneGroup
description: A container for panes or nested pane groups.
section: Components
---

<script>
	import { PropField, Collapsible } from '@svecodocs/kit';
</script>

The `PaneGroup` component wraps a collection of `Pane`s or nested `PaneGroup`s and is used to initialize and manage the layout of the panes.

## API Reference

### Props

<PropField name="direction" required type="'horizontal' | 'vertical'">
The direction of the panes within the group.
</PropField>

<PropField name="autoSaveId" type="string">
The id to save the layout of the panes to in local storage.
</PropField>

<PropField name="keyboardResizeBy" type="number">
The amount of space to add to the pane group when the keyboard resize event is triggered.
</PropField>

<PropField name="onLayoutChange" type="(layout: number) => void | null">
A callback called when the layout of the panes within the group changes.
</PropField>

<PropField name="storage" type="PaneGroupStorage" defaultValue="localStorage">
<Collapsible title="properties">
<PropField name="getItem" type="(name: string) => string | null" required>
	Retrieves the item from storage.
</PropField>
<PropField name="setItem" type="(name: string, value: string) => void" required>
	Sets the item to storage.
</PropField>
</Collapsible>
</PropField>

<PropField name="ref" type="HTMLElement | null">
A reference to the underlying DOM element of the pane group. You can bind to this prop to get a reference to the element.
</PropField>

<PropField name="this" type="PaneGroup">
Retrieve a reference to the component to access methods for controlling the pane group.
<Collapsible title="methods">
<PropField name="getLayout" type="() => number[]">
Get the layout of the pane group.
</PropField>
<PropField name="setLayout" type="(layout: number[]) => void">
Set the layout of the pane group.
</PropField>
<PropField name="getId" type="() => string">
Get the ID of the pane group.
</PropField>
</Collapsible>
</PropField>

### Data Attributes

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
