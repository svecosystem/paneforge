---
title: Nested Groups
description: An example of nesting groups of panes for more complex layouts.
---

<script>
	import { NestedGroupsDemo } from '$lib/components/demos'
</script>

<NestedGroupsDemo />

## Anatomy

Here's a high-level structure of the example above:

```svelte
<script lang="ts">
	import { PaneGroup, Pane, PaneResizer } from "paneforge";
</script>

<PaneGroup direction="horizontal">
	<Pane defaultSize={50} />
	<PaneResizer />
	<Pane defaultSize={50}>
		<PaneGroup direction="vertical">
			<Pane defaultSize={50} />
			<PaneResizer />
			<Pane defaultSize={50} />
		</PaneGroup>
	</Pane>
</PaneGroup>
```
