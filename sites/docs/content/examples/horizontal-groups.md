---
title: Horizontal Groups
description: An example of a horizontal group of panes.
---

<script>
	import { HorizontalDemo } from '$lib/components/demos'
</script>

<HorizontalDemo />

## Anatomy

Here's a high-level structure of the example above:

```svelte
<script lang="ts">
	import { PaneGroup, Pane, PaneResizeHandle } from "paneforge";
</script>

<PaneGroup direction="horizontal">
	<Pane defaultSize={50} />
	<PaneResizeHandle />
	<Pane defaultSize={50} />
</PaneGroup>
```
