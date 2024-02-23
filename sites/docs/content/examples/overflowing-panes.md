---
title: Overflowing Panes
description: An example of how panes with overflowing content are handled.
---

<script>
	import { OverflowDemo } from '$lib/components/demos'
</script>

<OverflowDemo />

## Anatomy

Here's the high-level structure of the example above:

```svelte
<script lang="ts">
	import { PaneGroup, Pane, PaneResizer } from "paneforge";
</script>

<PaneGroup direction="horizontal">
	<Pane defaultSize={50}>
		<div class="overflow-auto">
			<!-- ... content here-->
		</div>
	</Pane>
	<PaneResizer />
	<Pane defaultSize={50}>
		<PaneGroup direction="vertical">
			<Pane defaultSize={25}>
				<div class="overflow-auto">
					<!-- ... content here-->
				</div>
			</Pane>
			<PaneResizer />
			<Pane defaultSize={75}>
				<div class="overflow-auto">
					<!-- ... content here-->
				</div>
			</Pane>
		</PaneGroup>
	</Pane>
</PaneGroup>
```
