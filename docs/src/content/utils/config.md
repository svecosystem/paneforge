---
title: PaneForgeConfig
description: Configuration context provider for PaneForge components.
section: Utilities
---

<script>
	import { PropField } from '@svecodocs/kit'
</script>

`PaneForgeConfig` is a context provider component that configures how PaneForge components interact with their environment. It allows you to customize the root node for DOM operations, which is especially useful when working with Shadow DOM, iframes, Electron applications, or other complex DOM contexts.

You can opt to either wrap your entire application in a single `PaneForgeConfig` component, or use them in a more granular way to target specific parts of your application.

## Basic Usage

By default, PaneForge uses the global `document` object for DOM operations. If this is your preferred behavior, you don't need to use this component at all, but here's essentially what it would look like if you did:

```svelte title="+layout.svelte"
<script lang="ts">
	import { PaneForgeConfig } from "paneforge";

	let { children } = $props();
</script>

<PaneForgeConfig getRootNode={() => document}>
	{@render children()}
</PaneForgeConfig>
```

## Advanced Scenarios

### Shadow DOM

When using PaneForge within Shadow DOM components, you'll need to point to the correct shadow root:

```svelte title="+layout.svelte"
<script lang="ts">
	import { PaneForgeConfig } from "paneforge";

	let { children } = $props();

	let hostElement: HTMLElement = $state()!;
	const getRootNode = () => hostElement.shadowRoot || document;
</script>

<div bind:this={hostElement}>
	<PaneForgeConfig {getRootNode}>
		{@render children()}
	</PaneForgeConfig>
</div>
```

### iframes

For applications using `iframes`, configure PaneForge to use the iframe's document:

```svelte
<script lang="ts">
	import { PaneForgeConfig } from "paneforge";

	let { children } = $props();
	let iframe: HTMLIFrameElement = $state()!;

	const getRootNode = () => iframe?.contentDocument || document;
</script>

<iframe bind:this={iframe} title="Content Frame">
	<PaneForgeConfig {getRootNode}>
		{@render children()}
	</PaneForgeConfig>
</iframe>
```

### Electron Applications

In Electron applications, you might need to handle multiple windows or webviews:

```svelte
<script lang="ts">
	import { PaneForgeConfig } from "paneforge";
	import type { WebviewTag } from "electron";

	let { children } = $props();
	let webview: WebviewTag = $state()!;

	const getRootNode = () => {
		// Access the webview's document
		return webview?.getWebContents()?.hostWebContents?.document || document;
	};
</script>

<webview bind:this={webview}>
	<PaneForgeConfig {getRootNode}>
		{@render children()}
	</PaneForgeConfig>
</webview>
```

## API Reference

### Props

<PropField type="() => Document | ShadowRoot" name="getRootNode" defaultValue="() => document">
	A function that returns the root node for PaneForge to use for DOM operations.
</PropField>
