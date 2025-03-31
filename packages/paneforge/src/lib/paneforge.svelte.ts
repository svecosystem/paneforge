import {
	type ReadableBoxedValues,
	type WithRefProps,
	addEventListener,
	executeCallbacks,
	useRefById,
} from "svelte-toolbelt";
import { onMount, untrack, tick } from "svelte";
import { createContext } from "$lib/internal/utils/createContext.js";
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
	PaneData,
	PaneOnCollapse,
	PaneOnExpand,
	PaneOnResize,
	PaneResizeHandleOnDragging,
	PaneTransitionState,
	ResizeEvent,
	ResizeHandler,
} from "$lib/internal/types.js";
import {
	type PaneGroupStorage,
	initializeStorage,
	loadPaneGroupState,
	updateStorageValues,
} from "$lib/internal/utils/storage.js";

type PaneGroupStateProps = WithRefProps<
	ReadableBoxedValues<{
		autoSaveId: string | null;
		direction: Direction;
		keyboardResizeBy: number | null;
		onLayout: (layout: number[]) => void | null;
		storage: PaneGroupStorage;
	}>
>;

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

class PaneGroupState {
	id: PaneGroupStateProps["id"];
	#ref: PaneGroupStateProps["ref"];
	#autoSaveId: PaneGroupStateProps["autoSaveId"];
	direction: PaneGroupStateProps["direction"];
	#keyboardResizeBy: PaneGroupStateProps["keyboardResizeBy"];
	#onLayout: PaneGroupStateProps["onLayout"];
	#storage: PaneGroupStateProps["storage"];
	dragState = $state.raw<DragState | null>(null);
	layout = $state.raw<number[]>([]);
	paneDataArray = $state.raw<PaneData[]>([]);
	paneDataArrayChanged = $state<boolean>(false);

	paneIdToLastNotifiedSizeMap = $state<Record<string, number>>({});
	paneSizeBeforeCollapseMap = new Map<string, number>();
	prevDelta = $state(0);

	constructor(props: PaneGroupStateProps) {
		this.id = props.id;
		this.#ref = props.ref;
		this.#autoSaveId = props.autoSaveId;
		this.direction = props.direction;
		this.#keyboardResizeBy = props.keyboardResizeBy;
		this.#onLayout = props.onLayout;
		this.#storage = props.storage;

		useRefById({
			id: this.id,
			ref: this.#ref,
		});

		$effect(() => {
			const groupId = this.id.current;
			const layout = this.layout;
			const paneDataArray = this.paneDataArray;

			untrack(() => {
				const unsub = updateResizeHandleAriaValues({
					groupId,
					layout,
					paneDataArray,
				});

				return unsub;
			});
		});

		$effect(() => {
			untrack(() => {
				const unsub = this.#setResizeHandlerEventListeners();
				return unsub;
			});
		});

		$effect(() => {
			const autoSaveId = this.#autoSaveId.current;
			const layout = this.layout;
			const storage = this.#storage.current;
			if (!autoSaveId) return;

			untrack(() => {
				updateStorageValues({
					autoSaveId,
					layout,
					storage,
					paneDataArray: this.paneDataArray,
					paneSizeBeforeCollapse: this.paneSizeBeforeCollapseMap,
				});
			});
		});

		$effect(() => {
			const paneDataArrayChanged = this.paneDataArrayChanged;
			if (!paneDataArrayChanged) return;
			untrack(() => {
				this.paneDataArrayChanged = false;
				const autoSaveId = this.#autoSaveId.current;
				const storage = this.#storage.current;
				const prevLayout = this.layout;
				const paneDataArray = this.paneDataArray;

				let unsafeLayout: number[] | null = null;

				if (autoSaveId) {
					const state = loadPaneGroupState(autoSaveId, paneDataArray, storage);
					if (state) {
						this.paneSizeBeforeCollapseMap = new Map(
							Object.entries(state.expandToSizes)
						);
						unsafeLayout = state.layout;
					}
				}

				if (unsafeLayout == null) {
					unsafeLayout = getUnsafeDefaultLayout({
						paneDataArray,
					});
				}

				const nextLayout = validatePaneGroupLayout({
					layout: unsafeLayout,
					paneConstraints: paneDataArray.map((paneData) => paneData.constraints),
				});

				if (areArraysEqual(prevLayout, nextLayout)) return;

				this.layout = nextLayout;
				this.#onLayout.current?.(nextLayout);

				callPaneCallbacks(paneDataArray, nextLayout, this.paneIdToLastNotifiedSizeMap);
			});
		});
	}

	setLayout = (newLayout: number[]) => {
		this.layout = newLayout;
	};

	registerResizeHandle = (dragHandleId: string) => {
		return (e: ResizeEvent) => {
			e.preventDefault();

			const direction = this.direction.current;
			const dragState = this.dragState;
			const groupId = this.id.current;
			const keyboardResizeBy = this.#keyboardResizeBy.current;

			const prevLayout = this.layout;
			const paneDataArray = this.paneDataArray;

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
				this.#onLayout.current?.(nextLayout);
				callPaneCallbacks(paneDataArray, nextLayout, this.paneIdToLastNotifiedSizeMap);
			}
		};
	};

	resizePane = (paneData: PaneData, unsafePaneSize: number) => {
		const prevLayout = this.layout;
		const paneDataArray = this.paneDataArray;

		const paneConstraintsArr = paneDataArray.map((paneData) => paneData.constraints);

		const { paneSize, pivotIndices } = paneDataHelper(paneDataArray, paneData, prevLayout);

		assert(paneSize != null);

		const isLastPane = findPaneDataIndex(paneDataArray, paneData) === paneDataArray.length - 1;

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

		this.#onLayout.current?.(nextLayout);

		callPaneCallbacks(paneDataArray, nextLayout, this.paneIdToLastNotifiedSizeMap);
	};

	startDragging = (dragHandleId: string, e: ResizeEvent) => {
		const direction = this.direction.current;
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

	unregisterPane = (paneData: PaneData) => {
		const paneDataArray = [...this.paneDataArray];
		const index = findPaneDataIndex(paneDataArray, paneData);

		if (index < 0) return;
		paneDataArray.splice(index, 1);
		this.paneDataArray = paneDataArray;
		delete this.paneIdToLastNotifiedSizeMap[paneData.id];
		this.paneDataArrayChanged = true;
	};

	isPaneCollapsed = (paneData: PaneData) => {
		const paneDataArray = this.paneDataArray;
		const layout = this.layout;
		const {
			collapsedSize = 0,
			collapsible,
			paneSize,
		} = paneDataHelper(paneDataArray, paneData, layout);

		return collapsible === true && paneSize === collapsedSize;
	};

	expandPane = (paneData: PaneData) => {
		const prevLayout = this.layout;
		const paneDataArray = this.paneDataArray;

		if (!paneData.constraints.collapsible) return;
		const paneConstraintsArray = paneDataArray.map((paneData) => paneData.constraints);

		const {
			collapsedSize = 0,
			paneSize,
			minSize = 0,
			pivotIndices,
		} = paneDataHelper(paneDataArray, paneData, prevLayout);

		if (paneSize !== collapsedSize) return;
		// restore this pane to the size it was before it was collapsed, if possible.
		const prevPaneSize = this.paneSizeBeforeCollapseMap.get(paneData.id);
		const baseSize = prevPaneSize != null && prevPaneSize >= minSize ? prevPaneSize : minSize;

		const isLastPane = findPaneDataIndex(paneDataArray, paneData) === paneDataArray.length - 1;
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

		this.#onLayout.current?.(nextLayout);

		callPaneCallbacks(paneDataArray, nextLayout, this.paneIdToLastNotifiedSizeMap);
	};

	collapsePane = (paneData: PaneData) => {
		const prevLayout = this.layout;
		const paneDataArray = this.paneDataArray;

		if (!paneData.constraints.collapsible) return;

		const paneConstraintsArray = paneDataArray.map((paneData) => paneData.constraints);

		const {
			collapsedSize = 0,
			paneSize,
			pivotIndices,
		} = paneDataHelper(paneDataArray, paneData, prevLayout);

		assert(paneSize != null);

		if (paneSize === collapsedSize) return;

		// Store the size before collapse, which is returned when `expand()` is called
		this.paneSizeBeforeCollapseMap.set(paneData.id, paneSize);

		const isLastPane = findPaneDataIndex(paneDataArray, paneData) === paneDataArray.length - 1;
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
		this.#onLayout.current?.(nextLayout);

		callPaneCallbacks(paneDataArray, nextLayout, this.paneIdToLastNotifiedSizeMap);
	};

	getPaneSize = (paneData: PaneData) => {
		const { paneSize } = paneDataHelper(this.paneDataArray, paneData, this.layout);
		return paneSize;
	};

	getPaneStyle = (paneData: PaneData, defaultSize: number | undefined) => {
		const paneDataArray = this.paneDataArray;
		const layout = this.layout;
		const dragState = this.dragState;

		const paneIndex = findPaneDataIndex(paneDataArray, paneData);
		return computePaneFlexBoxStyle({
			defaultSize,
			dragState,
			layout,
			paneData: paneDataArray,
			paneIndex,
		});
	};

	isPaneExpanded = (paneData: PaneData) => {
		const {
			collapsedSize = 0,
			collapsible,
			paneSize,
		} = paneDataHelper(this.paneDataArray, paneData, this.layout);
		return !collapsible || paneSize > collapsedSize;
	};

	registerPane = (paneData: PaneData) => {
		const newPaneDataArray = [...this.paneDataArray, paneData];
		newPaneDataArray.sort((paneA, paneB) => {
			const orderA = paneA.order;
			const orderB = paneB.order;

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
		this.paneDataArray = newPaneDataArray;
		this.paneDataArrayChanged = true;
	};

	#setResizeHandlerEventListeners = () => {
		const groupId = this.id.current;
		const handles = getResizeHandleElementsForGroup(groupId);
		const paneDataArray = this.paneDataArray;

		const unsubHandlers = handles.map((handle) => {
			const handleId = handle.getAttribute("data-pane-resizer-id");
			if (!handleId) return noop;

			const [idBefore, idAfter] = getResizeHandlePaneIds(groupId, handleId, paneDataArray);

			if (idBefore == null || idAfter == null) return noop;

			const onKeydown = (e: KeyboardEvent) => {
				if (e.defaultPrevented || e.key !== "Enter") return;

				e.preventDefault();
				const paneDataArray = this.paneDataArray;
				const index = paneDataArray.findIndex((paneData) => paneData.id === idBefore);

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

	props = $derived.by(() => ({
		id: this.id.current,
		"data-pane-group": "",
		"data-direction": this.direction.current,
		"data-pane-group-id": this.id.current,
		style: {
			display: "flex",
			flexDirection: this.direction.current === "horizontal" ? "row" : "column",
			height: "100%",
			overflow: "hidden",
			width: "100%",
		},
	}));

	createResizer = (props: PaneResizerStateProps) => {
		return new PaneResizerState(props, this);
	};

	createPane = (props: PaneStateProps) => {
		return new PaneState(props, this);
	};
}

type PaneResizerStateProps = WithRefProps<
	ReadableBoxedValues<{
		onDraggingChange: PaneResizeHandleOnDragging;
		disabled: boolean;
		tabIndex: number;
	}>
>;

const resizeKeys = ["ArrowDown", "ArrowLeft", "ArrowRight", "ArrowUp", "End", "Home"];

class PaneResizerState {
	#id: PaneResizerStateProps["id"];
	#ref: PaneResizerStateProps["ref"];
	#onDraggingChange: PaneResizerStateProps["onDraggingChange"];
	#disabled: PaneResizerStateProps["disabled"];
	#tabIndex: PaneResizerStateProps["tabIndex"];
	#group: PaneGroupState;
	#isDragging = $derived.by(() => this.#group.dragState?.dragHandleId === this.#id.current);
	#isFocused = $state(false);
	resizeHandler: ResizeHandler | null = null;

	constructor(props: PaneResizerStateProps, group: PaneGroupState) {
		this.#id = props.id;
		this.#ref = props.ref;
		this.#group = group;
		this.#onDraggingChange = props.onDraggingChange;
		this.#disabled = props.disabled;
		this.#tabIndex = props.tabIndex;

		useRefById({
			id: this.#id,
			ref: this.#ref,
		});

		$effect(() => {
			if (this.#disabled.current) {
				this.resizeHandler = null;
			} else {
				this.resizeHandler = this.#group.registerResizeHandle(this.#id.current);
			}
		});

		$effect(() => {
			const node = this.#ref.current;
			if (!node) return;
			const disabled = this.#disabled.current;
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
				this.#onDraggingChange.current(false);
			};

			const unsub = executeCallbacks(
				addEventListener(document.body, "contextmenu", stopDraggingAndBlur),
				addEventListener(document.body, "mousemove", onMove),
				addEventListener(document.body, "touchmove", onMove, { passive: false }),
				addEventListener(document.body, "mouseleave", onMouseLeave),
				addEventListener(window, "mouseup", stopDraggingAndBlur),
				addEventListener(window, "touchend", stopDraggingAndBlur)
			);

			return unsub;
		});
	}

	#startDragging = (e: MouseEvent | TouchEvent) => {
		e.preventDefault();

		if (this.#disabled.current) return;
		this.#group.startDragging(this.#id.current, e);
		this.#onDraggingChange.current(true);
	};

	#stopDraggingAndBlur = () => {
		const node = this.#ref.current;
		if (!node) return;
		node.blur();
		this.#group.stopDragging();
		this.#onDraggingChange.current(false);
	};

	#onkeydown = (e: KeyboardEvent) => {
		if (this.#disabled.current || !this.resizeHandler || e.defaultPrevented) return;

		if (resizeKeys.includes(e.key)) {
			e.preventDefault();
			this.resizeHandler(e);
			return;
		}

		if (e.key !== "F6") return;

		e.preventDefault();

		const handles = getResizeHandleElementsForGroup(this.#group.id.current);
		const index = getResizeHandleElementIndex(this.#group.id.current, this.#id.current);

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

	#onblur = () => {
		this.#isFocused = false;
	};

	#onfocus = () => {
		this.#isFocused = true;
	};

	#onmousedown = (e: MouseEvent) => {
		this.#startDragging(e);
	};

	#onmouseup = () => {
		this.#stopDraggingAndBlur();
	};

	#ontouchcancel = () => {
		this.#stopDraggingAndBlur();
	};

	#ontouchend = () => {
		this.#stopDraggingAndBlur();
	};

	#ontouchstart = (e: TouchEvent) => {
		this.#startDragging(e);
	};

	props = $derived.by(
		() =>
			({
				id: this.#id.current,
				role: "separator",
				"data-direction": this.#group.direction.current,
				"data-pane-group-id": this.#group.id.current,
				"data-active": this.#isDragging
					? "pointer"
					: this.#isFocused
						? "keyboard"
						: undefined,
				"data-enabled": !this.#disabled.current,
				"data-pane-resizer-id": this.#id.current,
				"data-pane-resizer": "",
				tabIndex: this.#tabIndex.current,
				style: {
					cursor: getCursorStyle(this.#group.direction.current),
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
			}) as const
	);
}

type PaneStateProps = WithRefProps<
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
	}>
>;

class PaneState {
	#id: PaneStateProps["id"];
	#ref: PaneStateProps["ref"];
	#collapsedSize: PaneStateProps["collapsedSize"];
	#collapsible: PaneStateProps["collapsible"];
	#defaultSize: PaneStateProps["defaultSize"];
	#maxSize: PaneStateProps["maxSize"];
	#minSize: PaneStateProps["minSize"];
	#order: PaneStateProps["order"];
	#onCollapse: PaneStateProps["onCollapse"];
	#onExpand: PaneStateProps["onExpand"];
	#onResize: PaneStateProps["onResize"];
	#group: PaneGroupState;
	#paneTransitionState: PaneTransitionState = $state("");

	#paneData = $derived.by(() => ({
		callbacks: {
			onCollapse: this.#onCollapse.current,
			onExpand: this.#onExpand.current,
			onResize: this.#onResize.current,
		},
		constraints: {
			collapsedSize: this.#collapsedSize.current,
			collapsible: this.#collapsible.current,
			defaultSize: this.#defaultSize.current,
			maxSize: this.#maxSize.current,
			minSize: this.#minSize.current,
		},
		id: this.#id.current,
		idIsFromProps: false,
		order: this.#order.current,
	}));

	#handleTransition = (state: PaneTransitionState) => {
		this.#paneTransitionState = state;
		tick().then(() => {
			if (this.#ref.current) {
				const element = this.#ref.current;
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

	pane = {
		collapse: () => {
			this.#handleTransition("collapsing");
			this.#group.collapsePane(this.#paneData);
		},
		expand: () => {
			this.#handleTransition("expanding");
			this.#group.expandPane(this.#paneData);
		},
		getSize: () => this.#group.getPaneSize(this.#paneData),
		isCollapsed: () => this.#group.isPaneCollapsed(this.#paneData),
		isExpanded: () => this.#group.isPaneExpanded(this.#paneData),
		resize: (size: number) => this.#group.resizePane(this.#paneData, size),
		getId: () => this.#id.current,
	};

	constructor(props: PaneStateProps, group: PaneGroupState) {
		this.#id = props.id;
		this.#ref = props.ref;
		this.#collapsedSize = props.collapsedSize;
		this.#collapsible = props.collapsible;
		this.#defaultSize = props.defaultSize;
		this.#maxSize = props.maxSize;
		this.#minSize = props.minSize;
		this.#order = props.order;
		this.#onCollapse = props.onCollapse;
		this.#onExpand = props.onExpand;
		this.#onResize = props.onResize;
		this.#group = group;

		useRefById({
			id: this.#id,
			ref: this.#ref,
		});

		onMount(() => {
			this.#group.registerPane(this.#paneData);

			return () => {
				this.#group.unregisterPane(this.#paneData);
			};
		});
	}

	#isCollapsed = $derived.by(() => this.#group.isPaneCollapsed(this.#paneData));
	#paneState = $derived.by(() =>
		this.#paneTransitionState !== ""
			? this.#paneTransitionState
			: this.#isCollapsed
				? "collapsed"
				: "expanded"
	);

	props = $derived.by(() => ({
		id: this.#id.current,
		style: this.#group.getPaneStyle(this.#paneData, this.#defaultSize.current),
		"data-pane": "",
		"data-pane-id": this.#id.current,
		"data-pane-group-id": this.#group.id.current,
		"data-collapsed": this.#isCollapsed ? "" : undefined,
		"data-expanded": this.#isCollapsed ? undefined : "",
		"data-pane-state": this.#paneState,
	}));
}

const [setPaneGroupContext, getPaneGroupContext] = createContext<PaneGroupState>("PaneGroup");

export function usePaneGroup(props: PaneGroupStateProps) {
	return setPaneGroupContext(new PaneGroupState(props));
}

export function usePaneResizer(props: PaneResizerStateProps) {
	return getPaneGroupContext().createResizer(props);
}

export function usePane(props: PaneStateProps) {
	return getPaneGroupContext().createPane(props);
}
