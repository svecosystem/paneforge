<script lang="ts">
	import { box, mergeProps } from "svelte-toolbelt";
	import type { PaneProps } from "./types.js";
	import { noop } from "$lib/internal/helpers.js";
	import { PaneState } from "$lib/paneforge.svelte.js";

	const uid = $props.id();

	let {
		id = uid,
		ref = $bindable(null),
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

	const paneState = PaneState.create({
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

	export const collapse = paneState.pane.collapse;
	export const expand = paneState.pane.expand;
	export const getSize = paneState.pane.getSize;
	export const isCollapsed = paneState.pane.isCollapsed;
	export const isExpanded = paneState.pane.isExpanded;
	export const resize = paneState.pane.resize;
	export const getId = paneState.pane.getId;

	const mergedProps = $derived(mergeProps(restProps, paneState.props));
</script>

{#if child}
	{@render child({ props: mergedProps })}
{:else}
	<div {...mergedProps}>
		{@render children?.()}
	</div>
{/if}
