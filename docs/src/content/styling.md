---
title: Styling
description: Easily style the various parts of your panes.
section: Anchors
---

For each component that renders an HTML element, we expose a `class` prop that you can use to apply styles to the component. This is the recommended and most straightforward way to style them.

## CSS frameworks

If you're using a CSS framework like TailwindCSS or UnoCSS, you can simply pass the classes you need to the component, and they will be applied to the underlying HTML element.

```svelte
<script lang="ts">
	import { Pane } from "paneforge";
</script>

<Pane class="h-12 w-full bg-blue-500 ">
	<!-- ... -->
</Pane>
```

## Data attributes

A data attribute is applied to each element rendered by PaneForge, which you can use to target the component across your entire application. Check out the API reference of the component to determine what those data attributes are.

You can then use those data attributes like so:

#### Define global styles

```css title="src/app.pcss"
[data-pane-group] {
	height: 3rem;
	width: 100%;
	background-color: #3182ce;
	color: #fff;
}
```

#### Import stylesheet

```svelte title="src/routes/+layout.svelte"
<script lang="ts">
	import "../app.pcss";

	let { children } = $props();
</script>

{@render children()}
```

Now every `<PaneGroup />` component will have the styles applied to it.

## Global classes

If you prefer the class approach, you can simply apply your global classes to the component.

#### 1. Define global styles

<br />

```css title="src/app.pcss"
.pane-group {
	height: 3rem;
	width: 100%;
	background-color: #3182ce;
	color: #fff;
}
```

#### 2. Apply global styles

<br />

```svelte title="src/routes/+layout.svelte"
<script lang="ts">
	import "../app.pcss";

	let { children } = $props();
</script>

{@render children()}
```

#### 3. Use with components

<br />

```svelte title="Button.svelte"
<script lang="ts">
	import { PaneGroup } from "paneforge";
</script>

<PaneGroup class="pane-group">Click me</PaneGroup>
```

## Style Prop

PaneForge components accept a `style` prop, which will be gracefully merged with the component's internal styles to create a single style string.
