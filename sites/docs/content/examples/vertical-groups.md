---
title: Vertical Groups
description: An example of a vertical group of panes.
---

<script>
	import { VerticalDemo } from '$lib/components/demos'
</script>

<VerticalDemo />

## Anatomy

Here's a high-level structure of the example above:

```svelte
<script lang="ts">
	import { PaneGroup, Pane, PaneResizeHandle } from "paneforge";
</script>

<PaneGroup direction="vertical">
	<Pane defaultSize={50} />
	<PaneResizeHandle />
	<Pane defaultSize={50} />
</PaneGroup>
```
