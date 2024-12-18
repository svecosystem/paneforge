<script lang="ts">
	import { environmentContext } from "$lib/paneforge.svelte.js";
	import { EnvironmentState } from "svelte-toolbelt";
	import type { PaneForgeConfigProps } from "./types.js";
	let { children, ...restProps }: PaneForgeConfigProps = $props();
	environmentContext.set(new EnvironmentState(restProps));
</script>

{@render children?.()}
