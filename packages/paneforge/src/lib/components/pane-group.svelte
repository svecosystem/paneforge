<script lang="ts">
	import { box, mergeProps } from "svelte-toolbelt";
	import type { PaneGroupProps } from "./types.js";
	import { noop } from "$lib/internal/helpers.js";
	import { useId } from "$lib/internal/utils/useId.js";
	import { defaultStorage, PaneGroupState } from "$lib/paneforge.svelte.js";

	let {
		autoSaveId = null,
		direction,
		id = useId(),
		keyboardResizeBy = null,
		onLayoutChange = noop,
		storage = defaultStorage,
		ref = $bindable(null),
		child,
		children,
		...restProps
	}: PaneGroupProps = $props();

	const paneGroupState = PaneGroupState.create({
		id: box.with(() => id ?? useId()),
		ref: box.with(
			() => ref,
			(v) => (ref = v)
		),
		autoSaveId: box.with(() => autoSaveId),
		direction: box.with(() => direction),
		keyboardResizeBy: box.with(() => keyboardResizeBy),
		onLayout: box.with(() => onLayoutChange),
		storage: box.with(() => storage),
	});

	export const getLayout = () => paneGroupState.layout;
	export const setLayout = paneGroupState.setLayout;
	export const getId = () => paneGroupState.opts.id.current;

	const mergedProps = $derived(mergeProps(restProps, paneGroupState.props));
</script>

{#if child}
	{@render child({ props: mergedProps })}
{:else}
	<div {...mergedProps}>
		{@render children?.()}
	</div>
{/if}
