<script lang="ts">
	import { Pane, PaneGroup, PaneResizer } from "paneforge";
	import DotsSixVertical from "phosphor-svelte/lib/DotsSixVertical";

	let { layout }: { layout?: number[] } = $props();

	function onLayoutChange(sizes: number[]) {
		document.cookie = `PaneForge:layout=${JSON.stringify(sizes)}`;
	}
</script>

<div class="mt-4">
	<PaneGroup direction="horizontal" class="w-full rounded-lg" {onLayoutChange}>
		<Pane defaultSize={layout ? layout[0] : 50} class="bg-muted rounded-lg">
			<div class="flex h-[400px] items-center justify-center p-6">
				<span class="font-semibold">Left</span>
			</div>
		</Pane>
		<PaneResizer class="bg-background relative flex w-2 items-center justify-center">
			<div class="bg-brand z-10 flex h-7 w-5 items-center justify-center rounded-sm border">
				<DotsSixVertical class="size-4 text-black" weight="bold" />
			</div>
		</PaneResizer>
		<Pane defaultSize={layout ? layout[1] : 50} class="bg-muted rounded-lg">
			<div class="flex h-full items-center justify-center p-6">
				<span class="font-semibold">Right</span>
			</div>
		</Pane>
	</PaneGroup>
</div>
