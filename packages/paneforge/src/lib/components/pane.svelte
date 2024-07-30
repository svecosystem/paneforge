<script lang="ts">
	import { box, mergeProps } from "svelte-toolbelt";
	import { untrack } from "svelte";
	import type { PaneProps } from "./types.js";
	import { noop } from "$lib/internal/helpers.js";
	import { useId } from "$lib/internal/utils/useId.js";
	import { usePane } from "$lib/paneforge.svelte.js";

	let {
		id = useId(),
		ref = $bindable(null),
		setPaneApi = noop,
		collapsedSize,
		collapsible,
		defaultSize,
		maxSize,
		minSize,
		onCollapse = noop,
		onExpand = noop,
		onResize = noop,
		order,
		child,
		children,
		...restProps
	}: PaneProps = $props();

	const paneState = usePane({
		id: box.with(() => id),
		ref: box.with(
			() => ref,
			(v) => (ref = v)
		),
		collapsedSize: box.with(() => collapsedSize),
		collapsible: box.with(() => collapsible),
		defaultSize: box.with(() => defaultSize),
		maxSize: box.with(() => maxSize),
		minSize: box.with(() => minSize),
		onCollapse: box.with(() => onCollapse),
		onExpand: box.with(() => onExpand),
		onResize: box.with(() => onResize),
		order: box.with(() => order),
	});

	$effect(() => {
		untrack(() => {
			setPaneApi(paneState.pane);
		});
	});

	const mergedProps = $derived(mergeProps(restProps, paneState.props));
</script>

{#if child}
	{@render child({ props: mergedProps })}
{:else}
	<div {...mergedProps}>
		{@render children?.()}
	</div>
{/if}
