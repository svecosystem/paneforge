import { onDestroy, onMount } from "svelte";

/**
 * Safely calls `onMount` and catches any errors that occur.
 */
export function safeOnMount(fn: (...args: unknown[]) => unknown) {
	try {
		onMount(fn);
	} catch {
		return fn();
	}
}

/**
 * Safely calls `onDestroy` and catches any errors that occur.
 */
export function safeOnDestroy(fn: (...args: unknown[]) => unknown) {
	try {
		onDestroy(fn);
	} catch {
		return fn();
	}
}
