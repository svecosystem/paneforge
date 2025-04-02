<script lang="ts">
	import { PaneGroup, Pane, PaneResizer } from "paneforge";
	import DotsSixVertical from "phosphor-svelte/lib/DotsSixVertical";

	let innerWidth = $state(0);
	let panelMin = $derived(Math.ceil((300 / innerWidth) * 100));
</script>

<svelte:window bind:innerWidth />
<div class="flex w-full flex-col">
	<span>Panel Min: {panelMin}</span>

	<PaneGroup direction="horizontal" class="w-full rounded-lg">
		<Pane defaultSize={panelMin} minSize={panelMin} class="bg-muted rounded-lg">
			<div class="flex h-[400px] items-center justify-center p-6">
				<span class="font-semibold">Left</span>
			</div>
		</Pane>
		<PaneResizer class="bg-background relative flex w-2 items-center justify-center">
			<div
				class="bg-brand z-10 flex h-7 min-w-5 items-center justify-center rounded-sm border"
			>
				<DotsSixVertical class="size-4 text-black" weight="bold" />
			</div>
		</PaneResizer>
		<Pane class="bg-muted rounded-lg">
			<div class="flex h-full items-center justify-center p-6">
				<span class="font-semibold">Right</span>
			</div>
		</Pane>
	</PaneGroup>
</div>
