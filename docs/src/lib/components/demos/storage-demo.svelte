<script lang="ts">
	import { Pane, PaneGroup, PaneResizer } from "paneforge";
	import DotsSixVertical from "phosphor-svelte/lib/DotsSixVertical";
</script>

<div class="mt-4">
	<PaneGroup direction="horizontal" class="w-full rounded-lg" autoSaveId="someGroupId">
		<Pane defaultSize={50} class="bg-muted rounded-lg">
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
		<Pane defaultSize={50} class="bg-muted rounded-lg">
			<div class="flex h-full items-center justify-center p-6">
				<span class="font-semibold">Right</span>
			</div>
		</Pane>
	</PaneGroup>
</div>
