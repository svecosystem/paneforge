---
title: Reactive Size
description: An example of how to reactively set the size of the panes.
section: Examples
---

<script>
	import { ReactiveSizeDemo } from '$lib/components/demos'
	import ViewExampleCode from '$lib/components/view-example-code.svelte'
</script>

<ReactiveSizeDemo />

<ViewExampleCode href="https://github.com/svecosystem/paneforge/blob/main/sites/docs/src/lib/components/demos/reactive-size-demo.svelte" />

## Anatomy

Here's the high-level structure of the example above:

```svelte
<script lang="ts">
	import { PaneGroup, Pane, PaneResizer } from "paneforge";

	let innerWidth = $state(0);
	let panelMin = $derived(Math.ceil((300 / innerWidth) * 100));
</script>

<svelte:window bind:innerWidth />
<PaneGroup direction="horizontal">
	<Pane defaultSize={panelMin} minSize={panelMin}>Left</Pane>
	<PaneResizer />
	<Pane>Right</Pane>
</PaneGroup>
```
