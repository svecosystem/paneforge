let count = 0;

/**
 * Generates a unique ID based on a global counter.
 */
export function useId(prefix = "paneforge") {
	count++;
	return `${prefix}-${count}`;
}
