import {
	type ReadableBoxedValues,
	type WithRefProps,
	addEventListener,
	executeCallbacks,
	afterTick,
	attachRef,
} from "svelte-toolbelt";
import { onMount, untrack } from "svelte";
import { Context, watch } from "runed";
import {
	callPaneCallbacks,
	findPaneDataIndex,
	getDeltaPercentage,
	getPivotIndices,
	getResizeEventCursorPosition,
	getResizeHandleElement,
	getResizeHandleElementIndex,
	getResizeHandleElementsForGroup,
	getResizeHandlePaneIds,
	getUnsafeDefaultLayout,
	noop,
	paneDataHelper,
	updateResizeHandleAriaValues,
	validatePaneGroupLayout,
} from "$lib/internal/helpers.js";
import { isKeyDown, isMouseEvent, isTouchEvent } from "$lib/internal/utils/is.js";
import { adjustLayoutByDelta } from "$lib/internal/utils/adjust-layout.js";
import { areArraysEqual, areNumbersAlmostEqual } from "$lib/internal/utils/compare.js";
import {
	computePaneFlexBoxStyle,
	getCursorStyle,
	resetGlobalCursorStyle,
	setGlobalCursorStyle,
} from "$lib/internal/utils/style.js";
import { assert } from "$lib/internal/utils/assert.js";
import type {
	Direction,
	DragState,
	PaneOnCollapse,
	PaneOnExpand,
	PaneOnResize,
	PaneResizeHandleOnDragging,
	PaneTransitionState,
	RefAttachment,
	ResizeEvent,
	ResizeHandler,
} from "$lib/internal/types.js";
import {
	type PaneGroupStorage,
	initializeStorage,
	loadPaneGroupState,
	updateStorageValues,
} from "$lib/internal/utils/storage.js";
import { on } from "svelte/events";
import type {
	FocusEventHandler,
	KeyboardEventHandler,
	MouseEventHandler,
	TouchEventHandler,
} from "svelte/elements";

export const defaultStorage: PaneGroupStorage = {
	getItem: (name: string) => {
		initializeStorage(defaultStorage);
		return defaultStorage.getItem(name);
	},
	setItem: (name: string, value: string) => {
		initializeStorage(defaultStorage);
		defaultStorage.setItem(name, value);
	},
};

const PaneGroupContext = new Context<PaneGroupState>("PaneGroup");

interface PaneGroupStateOpts
	extends WithRefProps,
		ReadableBoxedValues<{
			autoSaveId: string | null;
			direction: Direction;
			keyboardResizeBy: number | null;
			onLayout: (layout: number[]) => void | null;
			storage: PaneGroupStorage;
		}> {}

export class PaneGroupState {
	static create(opts: PaneGroupStateOpts) {
		return PaneGroupContext.set(new PaneGroupState(opts));
	}

	readonly opts: PaneGroupStateOpts;
	readonly attachment: RefAttachment;
	dragState = $state.raw<DragState | null>(null);
	layout = $state.raw<number[]>([]);
	panesArray = $state.raw<PaneState[]>([]);
	panesArrayChanged = $state<boolean>(false);
	paneIdToLastNotifiedSizeMap = $state<Record<string, number>>({});
	paneSizeBeforeCollapseMap = new Map<string, number>();
	prevDelta = 0;

	constructor(opts: PaneGroupStateOpts) {
		this.opts = opts;
		this.attachment = attachRef(this.opts.ref);

		watch([() => this.opts.id.current, () => this.layout, () => this.panesArray], () => {
			return updateResizeHandleAriaValues({
				groupId: this.opts.id.current,
				layout: this.layout,
				panesArray: this.panesArray,
			});
		});

		$effect(() => {
			return untrack(() => {
				return this.#setResizeHandlerEventListeners();
			});
		});

		watch(
			[
				() => this.opts.autoSaveId.current,
				() => this.layout,
				() => this.opts.storage.current,
			],
			() => {
				if (!this.opts.autoSaveId.current) return;
				updateStorageValues({
					autoSaveId: this.opts.autoSaveId.current,
					layout: this.layout,
					storage: this.opts.storage.current,
					panesArray: this.panesArray,
					paneSizeBeforeCollapse: this.paneSizeBeforeCollapseMap,
				});
			}
		);

		watch(
			() => this.panesArrayChanged,
			() => {
				if (!this.panesArrayChanged) return;
				this.panesArrayChanged = false;
				// const autoSaveId = this.opts.autoSaveId.current;
				// const storage = this.opts.storage.current;
				const prevLayout = this.layout;
				// const paneDataArray = this.panesArray;

				let unsafeLayout: number[] | null = null;

				if (this.opts.autoSaveId.current) {
					const state = loadPaneGroupState(
						this.opts.autoSaveId.current,
						this.panesArray,
						this.opts.storage.current
					);
					if (state) {
						this.paneSizeBeforeCollapseMap = new Map(
							Object.entries(state.expandToSizes)
						);
						unsafeLayout = state.layout;
					}
				}

				if (unsafeLayout == null) {
					unsafeLayout = getUnsafeDefaultLayout({
						panesArray: this.panesArray,
					});
				}

				const nextLayout = validatePaneGroupLayout({
					layout: unsafeLayout,
					paneConstraints: this.panesArray.map((paneData) => paneData.constraints),
				});

				if (areArraysEqual(prevLayout, nextLayout)) return;

				this.layout = nextLayout;
				this.opts.onLayout.current?.(nextLayout);

				callPaneCallbacks(this.panesArray, nextLayout, this.paneIdToLastNotifiedSizeMap);
			}
		);
	}

	setLayout = (newLayout: number[]) => {
		this.layout = newLayout;
	};

	registerResizeHandle = (dragHandleId: string) => {
		return (e: ResizeEvent) => {
			e.preventDefault();

			const direction = this.opts.direction.current;
			const dragState = this.dragState;
			const groupId = this.opts.id.current;
			const keyboardResizeBy = this.opts.keyboardResizeBy.current;

			const prevLayout = this.layout;
			const paneDataArray = this.panesArray;

			const { initialLayout } = dragState ?? {};

			const pivotIndices = getPivotIndices(groupId, dragHandleId);

			let delta = getDeltaPercentage(e, dragHandleId, direction, dragState, keyboardResizeBy);
			if (delta === 0) return;

			// support RTL
			const isHorizontal = direction === "horizontal";
			if (document.dir === "rtl" && isHorizontal) {
				delta = -delta;
			}

			const paneConstraints = paneDataArray.map((paneData) => paneData.constraints);

			const nextLayout = adjustLayoutByDelta({
				delta,
				layout: initialLayout ?? prevLayout,
				paneConstraints,
				pivotIndices,
				trigger: isKeyDown(e) ? "keyboard" : "mouse-or-touch",
			});
			const layoutChanged = !areArraysEqual(prevLayout, nextLayout);

			// Only update the cursor for layout changes triggered by touch/mouse events (not keyboard)
			// Update the cursor even if the layout hasn't changed (we may need to show an invalid cursor state)
			if (isMouseEvent(e) || isTouchEvent(e)) {
				// Watch for multiple subsequent deltas; this might occur for tiny cursor movements.
				// In this case, Pane sizes might not change–
				// but updating cursor in this scenario would cause a flicker.
				const prevDelta = this.prevDelta;
				if (prevDelta !== delta) {
					this.prevDelta = delta;

					if (!layoutChanged) {
						// If the pointer has moved too far to resize the pane any further,
						// update the cursor style for a visual clue.
						// This mimics VS Code behavior.

						if (isHorizontal) {
							setGlobalCursorStyle(delta < 0 ? "horizontal-min" : "horizontal-max");
						} else {
							setGlobalCursorStyle(delta < 0 ? "vertical-min" : "vertical-max");
						}
					} else {
						setGlobalCursorStyle(isHorizontal ? "horizontal" : "vertical");
					}
				}
			}
			if (layoutChanged) {
				this.setLayout(nextLayout);
				this.opts.onLayout.current?.(nextLayout);
				callPaneCallbacks(paneDataArray, nextLayout, this.paneIdToLastNotifiedSizeMap);
			}
		};
	};

	resizePane = (paneState: PaneState, unsafePaneSize: number) => {
		const prevLayout = this.layout;
		const panesArray = this.panesArray;

		const paneConstraintsArr = panesArray.map((paneData) => paneData.constraints);

		const { paneSize, pivotIndices } = paneDataHelper(panesArray, paneState, prevLayout);

		assert(paneSize != null);

		const isLastPane = findPaneDataIndex(panesArray, paneState) === panesArray.length - 1;

		const delta = isLastPane ? paneSize - unsafePaneSize : unsafePaneSize - paneSize;

		const nextLayout = adjustLayoutByDelta({
			delta,
			layout: prevLayout,
			paneConstraints: paneConstraintsArr,
			pivotIndices,
			trigger: "imperative-api",
		});

		if (areArraysEqual(prevLayout, nextLayout)) return;

		this.setLayout(nextLayout);

		this.opts.onLayout.current?.(nextLayout);

		callPaneCallbacks(panesArray, nextLayout, this.paneIdToLastNotifiedSizeMap);
	};

	startDragging = (dragHandleId: string, e: ResizeEvent) => {
		const direction = this.opts.direction.current;
		const layout = this.layout;

		const handleElement = getResizeHandleElement(dragHandleId);

		assert(handleElement);

		const initialCursorPosition = getResizeEventCursorPosition(direction, e);

		this.dragState = {
			dragHandleId,
			dragHandleRect: handleElement.getBoundingClientRect(),
			initialCursorPosition,
			initialLayout: layout,
		};
	};

	stopDragging = () => {
		resetGlobalCursorStyle();
		this.dragState = null;
	};

	isPaneCollapsed = (pane: PaneState) => {
		const paneDataArray = this.panesArray;
		const layout = this.layout;
		const {
			collapsedSize = 0,
			collapsible,
			paneSize,
		} = paneDataHelper(paneDataArray, pane, layout);

		return collapsible === true && paneSize === collapsedSize;
	};

	expandPane = (pane: PaneState) => {
		const prevLayout = this.layout;
		const paneDataArray = this.panesArray;

		if (!pane.constraints.collapsible) return;
		const paneConstraintsArray = paneDataArray.map((paneData) => paneData.constraints);

		const {
			collapsedSize = 0,
			paneSize,
			minSize = 0,
			pivotIndices,
		} = paneDataHelper(paneDataArray, pane, prevLayout);

		if (paneSize !== collapsedSize) return;
		// restore this pane to the size it was before it was collapsed, if possible.
		const prevPaneSize = this.paneSizeBeforeCollapseMap.get(pane.opts.id.current);
		const baseSize = prevPaneSize != null && prevPaneSize >= minSize ? prevPaneSize : minSize;

		const isLastPane = findPaneDataIndex(paneDataArray, pane) === paneDataArray.length - 1;
		const delta = isLastPane ? paneSize - baseSize : baseSize - paneSize;

		const nextLayout = adjustLayoutByDelta({
			delta,
			layout: prevLayout,
			paneConstraints: paneConstraintsArray,
			pivotIndices,
			trigger: "imperative-api",
		});

		if (areArraysEqual(prevLayout, nextLayout)) return;

		this.setLayout(nextLayout);

		this.opts.onLayout.current?.(nextLayout);

		callPaneCallbacks(paneDataArray, nextLayout, this.paneIdToLastNotifiedSizeMap);
	};

	collapsePane = (pane: PaneState) => {
		const prevLayout = this.layout;
		const paneDataArray = this.panesArray;

		if (!pane.constraints.collapsible) return;

		const paneConstraintsArray = paneDataArray.map((paneData) => paneData.constraints);

		const {
			collapsedSize = 0,
			paneSize,
			pivotIndices,
		} = paneDataHelper(paneDataArray, pane, prevLayout);

		assert(paneSize != null);

		if (paneSize === collapsedSize) return;

		// Store the size before collapse, which is returned when `expand()` is called
		this.paneSizeBeforeCollapseMap.set(pane.opts.id.current, paneSize);

		const isLastPane = findPaneDataIndex(paneDataArray, pane) === paneDataArray.length - 1;
		const delta = isLastPane ? paneSize - collapsedSize : collapsedSize - paneSize;

		const nextLayout = adjustLayoutByDelta({
			delta,
			layout: prevLayout,
			paneConstraints: paneConstraintsArray,
			pivotIndices,
			trigger: "imperative-api",
		});

		if (areArraysEqual(prevLayout, nextLayout)) return;

		this.layout = nextLayout;
		this.opts.onLayout.current?.(nextLayout);

		callPaneCallbacks(paneDataArray, nextLayout, this.paneIdToLastNotifiedSizeMap);
	};

	getPaneSize = (pane: PaneState) => {
		return paneDataHelper(this.panesArray, pane, this.layout).paneSize;
	};

	getPaneStyle = (pane: PaneState, defaultSize: number | undefined) => {
		const paneDataArray = this.panesArray;
		const layout = this.layout;
		const dragState = this.dragState;

		const paneIndex = findPaneDataIndex(paneDataArray, pane);
		return computePaneFlexBoxStyle({
			defaultSize,
			dragState,
			layout,
			panesArray: paneDataArray,
			paneIndex,
		});
	};

	isPaneExpanded = (pane: PaneState) => {
		const {
			collapsedSize = 0,
			collapsible,
			paneSize,
		} = paneDataHelper(this.panesArray, pane, this.layout);
		return !collapsible || paneSize > collapsedSize;
	};

	registerPane = (pane: PaneState) => {
		const newPaneDataArray = [...this.panesArray, pane];
		newPaneDataArray.sort((paneA, paneB) => {
			const orderA = paneA.opts.order.current;
			const orderB = paneB.opts.order.current;

			if (orderA == null && orderB == null) {
				return 0;
			} else if (orderA == null) {
				return -1;
			} else if (orderB == null) {
				return 1;
			} else {
				return orderA - orderB;
			}
		});
		this.panesArray = newPaneDataArray;
		this.panesArrayChanged = true;

		return () => {
			const paneDataArray = [...this.panesArray];
			const index = findPaneDataIndex(this.panesArray, pane);

			if (index < 0) return;
			paneDataArray.splice(index, 1);
			this.panesArray = paneDataArray;
			delete this.paneIdToLastNotifiedSizeMap[pane.opts.id.current];
			this.panesArrayChanged = true;
		};
	};

	#setResizeHandlerEventListeners = () => {
		const groupId = this.opts.id.current;
		const handles = getResizeHandleElementsForGroup(groupId);
		const paneDataArray = this.panesArray;

		const unsubHandlers = handles.map((handle) => {
			const handleId = handle.getAttribute("data-pane-resizer-id");
			if (!handleId) return noop;

			const [idBefore, idAfter] = getResizeHandlePaneIds(groupId, handleId, paneDataArray);

			if (idBefore == null || idAfter == null) return noop;

			const onKeydown = (e: KeyboardEvent) => {
				if (e.defaultPrevented || e.key !== "Enter") return;

				e.preventDefault();
				const paneDataArray = this.panesArray;
				const index = paneDataArray.findIndex(
					(paneData) => paneData.opts.id.current === idBefore
				);

				if (index < 0) return;

				const paneData = paneDataArray[index];
				assert(paneData);
				const layout = this.layout;

				const size = layout[index];

				const { collapsedSize = 0, collapsible, minSize = 0 } = paneData.constraints;

				if (!(size != null && collapsible)) return;

				const nextLayout = adjustLayoutByDelta({
					delta: areNumbersAlmostEqual(size, collapsedSize)
						? minSize - size
						: collapsedSize - size,
					layout,
					paneConstraints: paneDataArray.map((paneData) => paneData.constraints),
					pivotIndices: getPivotIndices(groupId, handleId),
					trigger: "keyboard",
				});

				if (layout !== nextLayout) {
					this.layout = nextLayout;
				}
			};

			const unsubListener = addEventListener(handle, "keydown", onKeydown);

			return () => {
				unsubListener();
			};
		});

		return () => {
			for (const unsub of unsubHandlers) {
				unsub();
			}
		};
	};

	readonly props = $derived.by(
		() =>
			({
				id: this.opts.id.current,
				"data-pane-group": "",
				"data-direction": this.opts.direction.current,
				"data-pane-group-id": this.opts.id.current,
				style: {
					display: "flex",
					flexDirection: this.opts.direction.current === "horizontal" ? "row" : "column",
					height: "100%",
					overflow: "hidden",
					width: "100%",
				},
				...this.attachment,
			}) as const
	);
}

interface PaneResizerStateOpts
	extends WithRefProps,
		ReadableBoxedValues<{
			onDraggingChange: PaneResizeHandleOnDragging;
			disabled: boolean;
			tabIndex: number;
		}> {}

const resizeKeys = ["ArrowDown", "ArrowLeft", "ArrowRight", "ArrowUp", "End", "Home"];

export class PaneResizerState {
	static create(opts: PaneResizerStateOpts) {
		return new PaneResizerState(opts, PaneGroupContext.get());
	}
	readonly opts: PaneResizerStateOpts;
	readonly #group: PaneGroupState;
	readonly attachment: RefAttachment;

	readonly #isDragging = $derived.by(
		() => this.#group.dragState?.dragHandleId === this.opts.id.current
	);
	#isFocused = $state(false);
	resizeHandler: ResizeHandler | null = null;

	constructor(opts: PaneResizerStateOpts, group: PaneGroupState) {
		this.opts = opts;
		this.#group = group;
		this.attachment = attachRef(this.opts.ref);

		$effect(() => {
			if (this.opts.disabled.current) {
				this.resizeHandler = null;
			} else {
				this.resizeHandler = this.#group.registerResizeHandle(this.opts.id.current);
			}
		});

		$effect(() => {
			const node = this.opts.ref.current;
			if (!node) return;
			const disabled = this.opts.disabled.current;
			const resizeHandler = this.resizeHandler;
			const isDragging = this.#isDragging;
			if (disabled || resizeHandler === null || !isDragging) return;

			const onMove = (e: ResizeEvent) => {
				resizeHandler(e);
			};

			const onMouseLeave = (e: ResizeEvent) => {
				resizeHandler(e);
			};

			const stopDraggingAndBlur = () => {
				node.blur();
				this.#group.stopDragging();
				this.opts.onDraggingChange.current(false);
			};

			return executeCallbacks(
				on(document.body, "contextmenu", stopDraggingAndBlur),
				on(document.body, "mousemove", onMove),
				on(document.body, "touchmove", onMove, { passive: false }),
				on(document.body, "mouseleave", onMouseLeave),
				on(window, "mouseup", stopDraggingAndBlur),
				on(window, "touchend", stopDraggingAndBlur)
			);
		});
	}

	#startDragging = (e: MouseEvent | TouchEvent) => {
		e.preventDefault();

		if (this.opts.disabled.current) return;
		this.#group.startDragging(this.opts.id.current, e);
		this.opts.onDraggingChange.current(true);
	};

	#stopDraggingAndBlur = () => {
		const node = this.opts.ref.current;
		if (!node) return;
		node.blur();
		this.#group.stopDragging();
		this.opts.onDraggingChange.current(false);
	};

	#onkeydown: KeyboardEventHandler<HTMLElement> = (e) => {
		if (this.opts.disabled.current || !this.resizeHandler || e.defaultPrevented) return;

		if (resizeKeys.includes(e.key)) {
			e.preventDefault();
			this.resizeHandler(e);
			return;
		}

		if (e.key !== "F6") return;

		e.preventDefault();

		const handles = getResizeHandleElementsForGroup(this.#group.opts.id.current);
		const index = getResizeHandleElementIndex(
			this.#group.opts.id.current,
			this.opts.id.current
		);

		if (index === null) return;

		let nextIndex = 0;

		if (e.shiftKey) {
			// Moving backwards
			if (index > 0) {
				nextIndex = index - 1;
			} else {
				nextIndex = handles.length - 1;
			}
		} else {
			// Moving forwards
			if (index + 1 < handles.length) {
				nextIndex = index + 1;
			} else {
				nextIndex = 0;
			}
		}

		const nextHandle = handles[nextIndex];
		nextHandle.focus();
	};

	#onblur: FocusEventHandler<HTMLElement> = () => {
		this.#isFocused = false;
	};

	#onfocus: FocusEventHandler<HTMLElement> = () => {
		this.#isFocused = true;
	};

	#onmousedown: MouseEventHandler<HTMLElement> = (e) => {
		this.#startDragging(e);
	};

	#onmouseup: MouseEventHandler<HTMLElement> = () => {
		this.#stopDraggingAndBlur();
	};

	#ontouchcancel: TouchEventHandler<HTMLElement> = () => {
		this.#stopDraggingAndBlur();
	};

	#ontouchend: TouchEventHandler<HTMLElement> = () => {
		this.#stopDraggingAndBlur();
	};

	#ontouchstart: TouchEventHandler<HTMLElement> = (e: TouchEvent) => {
		this.#startDragging(e);
	};

	readonly props = $derived.by(
		() =>
			({
				id: this.opts.id.current,
				role: "separator",
				"data-direction": this.#group.opts.direction.current,
				"data-pane-group-id": this.#group.opts.id.current,
				"data-active": this.#isDragging
					? "pointer"
					: this.#isFocused
						? "keyboard"
						: undefined,
				"data-enabled": !this.opts.disabled.current,
				"data-pane-resizer-id": this.opts.id.current,
				"data-pane-resizer": "",
				tabIndex: this.opts.tabIndex.current,
				style: {
					cursor: getCursorStyle(this.#group.opts.direction.current),
					touchAction: "none",
					userSelect: "none",
					"-webkit-user-select": "none",
					"-webkit-touch-callout": "none",
				},
				onkeydown: this.#onkeydown,
				onblur: this.#onblur,
				onfocus: this.#onfocus,
				onmousedown: this.#onmousedown,
				onmouseup: this.#onmouseup,
				ontouchcancel: this.#ontouchcancel,
				ontouchend: this.#ontouchend,
				ontouchstart: this.#ontouchstart,
				...this.attachment,
			}) as const
	);
}

interface PaneStateOpts
	extends WithRefProps,
		ReadableBoxedValues<{
			collapsedSize: number | undefined;
			collapsible: boolean | undefined;
			defaultSize: number | undefined;
			maxSize: number | undefined;
			minSize: number | undefined;
			order: number | undefined;
			onCollapse: PaneOnCollapse;
			onExpand: PaneOnExpand;
			onResize: PaneOnResize;
		}> {}

export class PaneState {
	static create(opts: PaneStateOpts) {
		return new PaneState(opts, PaneGroupContext.get());
	}

	readonly opts: PaneStateOpts;
	readonly group: PaneGroupState;
	readonly attachment: RefAttachment;

	#paneTransitionState: PaneTransitionState = $state("");
	readonly callbacks = $derived.by(() => ({
		onCollapse: this.opts.onCollapse.current,
		onExpand: this.opts.onExpand.current,
		onResize: this.opts.onResize.current,
	}));

	readonly constraints = $derived.by(() => ({
		collapsedSize: this.opts.collapsedSize.current,
		collapsible: this.opts.collapsible.current,
		defaultSize: this.opts.defaultSize.current,
		maxSize: this.opts.maxSize.current,
		minSize: this.opts.minSize.current,
	}));

	#handleTransition = (state: PaneTransitionState) => {
		this.#paneTransitionState = state;
		afterTick(() => {
			if (this.opts.ref.current) {
				const element = this.opts.ref.current;
				const computedStyle = getComputedStyle(element);

				const hasTransition = computedStyle.transitionDuration !== "0s";

				if (!hasTransition) {
					this.#paneTransitionState = "";
					return;
				}
				const handleTransitionEnd = (event: TransitionEvent) => {
					// Only handle width/flex transitions
					if (event.propertyName === "flex-grow") {
						this.#paneTransitionState = "";
						element.removeEventListener("transitionend", handleTransitionEnd);
					}
				};

				// Always add the listener - if there's no transition, it won't fire
				element.addEventListener("transitionend", handleTransitionEnd);
			} else {
				this.#paneTransitionState = "";
			}
		});
	};

	readonly pane = {
		collapse: () => {
			this.#handleTransition("collapsing");
			this.group.collapsePane(this);
		},
		expand: () => {
			this.#handleTransition("expanding");
			this.group.expandPane(this);
		},
		getSize: () => this.group.getPaneSize(this),
		isCollapsed: () => this.group.isPaneCollapsed(this),
		isExpanded: () => this.group.isPaneExpanded(this),
		resize: (size: number) => this.group.resizePane(this, size),
		getId: () => this.opts.id.current,
	};

	constructor(opts: PaneStateOpts, group: PaneGroupState) {
		this.opts = opts;
		this.group = group;
		this.attachment = attachRef(this.opts.ref);

		onMount(() => {
			return this.group.registerPane(this);
		});

		watch(
			() => $state.snapshot(this.constraints),
			() => {
				this.group.panesArrayChanged = true;
			}
		);
	}

	readonly #isCollapsed = $derived.by(() => this.group.isPaneCollapsed(this));
	readonly #paneState = $derived.by(() =>
		this.#paneTransitionState !== ""
			? this.#paneTransitionState
			: this.#isCollapsed
				? "collapsed"
				: "expanded"
	);

	readonly props = $derived.by(
		() =>
			({
				id: this.opts.id.current,
				style: this.group.getPaneStyle(this, this.opts.defaultSize.current),
				"data-pane": "",
				"data-pane-id": this.opts.id.current,
				"data-pane-group-id": this.group.opts.id.current,
				"data-collapsed": this.#isCollapsed ? "" : undefined,
				"data-expanded": this.#isCollapsed ? undefined : "",
				"data-pane-state": this.#paneState,
				...this.attachment,
			}) as const
	);
}
