---
title: Collapsible Panes
description: An example of how to create collapsible panes.
---

<script>
	import { CollapsibleDemo } from '$lib/components/demos'
</script>

<div class="flex flex-col gap-4">
	<CollapsibleDemo />
</div>

## Anatomy

Here's a high-level structure of the example above:

```svelte
<script lang="ts">
	import { PaneGroup, Pane, PaneResizeHandle, type PaneAPI } from "paneforge";

	let paneOneApi: PaneAPI;
	let collapsed = false;
</script>

{#if collapsed}
	<button
		on:click={() => {
			paneOneApi?.expand();
		}}
	>
		Expand Pane One
	</button>
{:else}
	<button
		on:click={() => {
			paneOneApi?.collapse();
		}}
	>
		Collapse Pane One
	</button>
{/if}
<PaneGroup direction="horizontal">
	<Pane
		defaultSize={50}
		collapsedSize={5}
		collapsible={true}
		minSize={15}
		bind:api={paneOneApi}
		onCollapse={() => (collapsed = true)}
		onExpand={() => (collapsed = false)}
	/>
	<PaneResizeHandle />
	<Pane defaultSize={50}>
		<PaneGroup direction="vertical">
			<Pane defaultSize={50} />
			<PaneResizeHandle />
			<Pane defaultSize={50} />
		</PaneGroup>
	</Pane>
</PaneGroup>
```
