export function assert(
	// eslint-disable-next-line ts/no-explicit-any
	expectedCondition: any,
	message: string = "Assertion failed!"
): asserts expectedCondition {
	if (!expectedCondition) {
		console.error(message);
		throw new Error(message);
	}
}
