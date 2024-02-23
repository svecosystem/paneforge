---
title: Getting Started
description: Learn how to install and use Paneforge in your projects.
---

## Installation

Install Paneforge using your favorite package manager:

```bash
npm install paneforge
```

## Basic Usage

```svelte
<script lang="ts">
	import { PaneGroup, Pane, PaneResizer } from "paneforge";
</script>

<PaneGroup direction="horizontal">
	<Pane defaultSize={50}>Pane 1</Pane>
	<PaneResizer />
	<Pane defaultSize={50}>Pane 2</Pane>
</PaneGroup>
```
