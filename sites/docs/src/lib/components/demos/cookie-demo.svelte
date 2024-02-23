<script lang="ts">
	import { PaneGroup, Pane, PaneResizeHandle } from "paneforge";
	import { DotsSixVertical } from "$icons/index.js";

	export let defaultLayout: number[] | undefined = undefined;
	function onLayoutChange(sizes: number[]) {
		document.cookie = `paneforge:layout=${JSON.stringify(sizes)}`;
	}
</script>

<PaneGroup direction="horizontal" class="w-full rounded-lg" {onLayoutChange}>
	<Pane defaultSize={defaultLayout ? defaultLayout[0] : 50} class="bg-muted rounded-lg">
		<div class="flex h-[400px] items-center justify-center p-6">
			<span class="font-semibold">Left</span>
		</div>
	</Pane>
	<PaneResizeHandle class="bg-background relative flex w-2 items-center justify-center">
		<div class="bg-brand z-10 flex h-7 w-5 items-center justify-center rounded-sm border">
			<DotsSixVertical class="size-4 text-black" weight="bold" />
		</div>
	</PaneResizeHandle>
	<Pane defaultSize={defaultLayout ? defaultLayout[1] : 50} class="bg-muted rounded-lg">
		<div class="flex h-full items-center justify-center p-6">
			<span class="font-semibold">Right</span>
		</div>
	</Pane>
</PaneGroup>
