---
title: Vertical Groups
description: An example of a vertical group of panes.
---

<script>
	import { VerticalDemo } from '$lib/components/demos'
</script>

<VerticalDemo />

## Anatomy

Here's the high-level structure of the example above:

```svelte
<script lang="ts">
	import { PaneGroup, Pane, PaneResizer } from "paneforge";
</script>

<PaneGroup direction="vertical">
	<Pane defaultSize={50} />
	<PaneResizer />
	<Pane defaultSize={50} />
</PaneGroup>
```
