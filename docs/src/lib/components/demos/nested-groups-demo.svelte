<script lang="ts">
	import { Pane, PaneGroup, PaneResizer } from "paneforge";
	import DotsSixVertical from "phosphor-svelte/lib/DotsSixVertical";
</script>

<div class="mt-4">
	<PaneGroup direction="horizontal" class="w-full">
		<Pane defaultSize={50}>
			<div class="bg-muted flex h-[400px] items-center justify-center rounded-lg p-6">
				<span class="font-semibold">One</span>
			</div>
		</Pane>
		<PaneResizer class="bg-background relative flex w-2 items-center justify-center">
			<div
				class="bg-brand z-10 flex h-7 min-w-5 items-center justify-center rounded-sm border"
			>
				<DotsSixVertical class="size-4 shrink-0 text-black" weight="bold" />
			</div>
		</PaneResizer>
		<Pane defaultSize={50}>
			<PaneGroup direction="vertical">
				<Pane defaultSize={50}>
					<div class="bg-muted flex h-full items-center justify-center rounded-lg p-6">
						<span class="font-semibold">Two</span>
					</div>
				</Pane>
				<PaneResizer class="bg-background relative flex h-2 items-center justify-center">
					<div
						class="bg-brand z-10 flex h-5 w-7 items-center justify-center rounded-sm border"
					>
						<DotsSixVertical class="size-4 text-black" weight="bold" />
					</div>
				</PaneResizer>
				<Pane defaultSize={50}>
					<div class="bg-muted flex h-full items-center justify-center rounded-lg p-6">
						<span class="font-semibold">Three</span>
					</div>
				</Pane>
			</PaneGroup>
		</Pane>
	</PaneGroup>
</div>
