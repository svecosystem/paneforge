---
title: Pane
description: An individual pane within a pane group.
section: Components
---

<script>
	import { PropField, Collapsible } from '@svecodocs/kit'
</script>

The `Pane` component is used to create an individual pane within a `PaneGroup`.

## API Reference

### Props

<PropField name="collapsedSize" type="number">
	The size of the pane when it is in a collapsed state.
</PropField>

<PropField name="collapsible" type="boolean" defaultValue="false">
	Whether the pane can be collapsed.
</PropField>

<PropField name="defaultSize" type="number">
	The default size of the pane in percentage of the group's size.
</PropField>

<PropField name="maxSize" type="number" defaultValue="100">
	The maximum size of the pane in percentage of the group's size.
</PropField>

<PropField name="minSize" type="number" defaultValue="0">
	The minimum size of the pane in percentage of the group's size.
</PropField>

<PropField name="order" type="number">
	The order of the pane in the group. Useful for maintaining order when conditionally rendering panes.
</PropField>

<PropField name="onCollapse" type="() => void">
	A callback that is called when the pane is collapsed.
</PropField>

<PropField name="onExpand" type="() => void">
	A callback that is called when the pane is expanded.
</PropField>

<PropField name="onResize" type="(size: number, prevSize: number | undefined) => void">
	A callback that is called when the pane is resized.
</PropField>

<PropField name="ref" type="HTMLElement | null">

The underlying DOM element of the pane. You can `bind` to this prop to get a reference to the element.

</PropField>

<PropField name="this" type="Pane">
Retrieve a reference to the component to access methods for controlling the pane via its imperative API.
<Collapsible title="methods">
<PropField name="collapse" type="() => void">
	Collapse the pane to its minimum size.
</PropField>
<PropField name="expand" type="() => void">
	Expand the pane to its previous size.
</PropField>
<PropField name="getId" type="() => string">
	Get the ID of the pane.
</PropField>
<PropField name="getSize" type="() => number">
	Get the size of the pane.
</PropField>
<PropField name="isCollapsed" type="() => boolean">
	Check if the pane is collapsed.
</PropField>
<PropField name="isExpanded" type="() => boolean">
	Check if the pane is expanded.
</PropField>
<PropField name="resize" type="(size: number) => void">
	Resize the pane to the specified size.
</PropField>
</Collapsible>
</PropField>

### Data Attributes

The following data attributes are available for the `Pane` component:

```ts
export type PaneAttributes = {
	/** Applied to every pane element. */
	"data-pane": "";
	/** The ID of the pane. */
	"data-pane-id": string;
	/** The ID of the pane's group. */
	"data-pane-group-id": string;
};
```
