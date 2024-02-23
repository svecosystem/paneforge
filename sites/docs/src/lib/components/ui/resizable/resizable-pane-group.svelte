<script lang="ts">
	import * as ResizablePrimitive from "paneforge";

	type $$Props = ResizablePrimitive.PaneGroupProps;

	export let el: $$Props["el"] = undefined;
	export let direction: $$Props["direction"];
</script>

<ResizablePrimitive.PaneGroup bind:el {direction} {...$$restProps}>
	<slot />
</ResizablePrimitive.PaneGroup>
