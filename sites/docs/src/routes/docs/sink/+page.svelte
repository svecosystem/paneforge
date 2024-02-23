<script lang="ts">
	import {
		NestedGroupsDemo,
		HorizontalDemo,
		VerticalDemo,
		OverflowDemo,
		CollapsibleDemo,
		ConditionalDemo,
		CookieDemo,
	} from "$lib/components/demos";

	export let data;
</script>

<div class="flex flex-col gap-8">
	<div class="space-y-4">
		<h1 class="text-2xl font-semibold">Horizontal</h1>
		<HorizontalDemo />
	</div>
	<div class="space-y-4">
		<h1 class="text-2xl font-semibold">Vertical</h1>
		<VerticalDemo />
	</div>
	<div class="space-y-4">
		<h1 class="text-2xl font-semibold">Nested</h1>
		<NestedGroupsDemo />
	</div>
	<div class="space-y-4">
		<h1 class="text-2xl font-semibold">Overflowing Content</h1>
		<OverflowDemo />
	</div>
	<div class="space-y-4">
		<h1 class="text-2xl font-semibold">Collapsible</h1>
		<CollapsibleDemo />
	</div>
	<div class="space-y-4">
		<h1 class="text-2xl font-semibold">Conditional</h1>
		<ConditionalDemo />
	</div>
	<div class="space-y-4">
		<h1 class="text-2xl font-semibold">Conditional</h1>
		<CookieDemo defaultLayout={data.defaultLayout} />
	</div>
</div>
