<script lang="ts">
	import { environmentContext } from "$lib/paneforge.svelte.js";
	import type { PaneForgeConfigProps } from "./types.js";
	let { children, ...restProps }: PaneForgeConfigProps = $props();
	environmentContext.set(restProps);
</script>

{@render children()}
