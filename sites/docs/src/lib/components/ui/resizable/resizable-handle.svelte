<script lang="ts">
	import { DotsSixVertical } from "$icons/index.js";
	import { cn } from "$lib/utils";
	import * as ResizablePrimitive from "paneforge";

	type $$Props = ResizablePrimitive.PaneResizeHandleProps & {
		withHandle?: boolean;
	};

	let className: $$Props["class"] = undefined;
	export { className as class };
	export let withHandle: $$Props["withHandle"] = false;
</script>

<ResizablePrimitive.PaneResizeHandle
	class={cn(
		"relative flex w-[3px] items-center justify-center bg-border after:absolute after:inset-y-0 after:left-1/2 after:w-1 after:-translate-x-1/2 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-1 data-[pane-group-direction=vertical]:h-[3px] data-[pane-group-direction=vertical]:w-full data-[resize-handle-active=pointer]:bg-muted-foreground data-[pane-group-direction=vertical]:after:left-0 data-[pane-group-direction=vertical]:after:h-1 data-[pane-group-direction=vertical]:after:w-full data-[pane-group-direction=vertical]:after:-translate-y-1/2 data-[pane-group-direction=vertical]:after:translate-x-0 [&[data-pane-group-direction=vertical]>div]:rotate-90",
		className
	)}
	{...$$restProps}
>
	{#if withHandle}
		<div class="z-10 flex h-4 w-3 items-center justify-center rounded-sm border bg-border">
			<DotsSixVertical class="size-2.5" />
		</div>
	{/if}
</ResizablePrimitive.PaneResizeHandle>
