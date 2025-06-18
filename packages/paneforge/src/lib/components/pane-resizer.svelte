<script lang="ts">
	import { box, mergeProps } from "svelte-toolbelt";
	import type { PaneResizerProps } from "./types.js";
	import { noop } from "$lib/internal/helpers.js";
	import { PaneResizerState } from "$lib/paneforge.svelte.js";

	const uid = $props.id();

	let {
		id = uid,
		ref = $bindable(null),
		disabled = false,
		onDraggingChange = noop,
		tabindex = 0,
		child,
		children,
		...restProps
	}: PaneResizerProps = $props();

	const resizerState = PaneResizerState.create({
		id: box.with(() => id),
		ref: box.with(
			() => ref,
			(v) => (ref = v)
		),
		disabled: box.with(() => disabled),
		onDraggingChange: box.with(() => onDraggingChange),
		tabIndex: box.with(() => tabindex),
	});

	const mergedProps = $derived(mergeProps(restProps, resizerState.props));
</script>

{#if child}
	{@render child({ props: mergedProps })}
{:else}
	<div {...mergedProps}>
		{@render children?.()}
	</div>
{/if}
