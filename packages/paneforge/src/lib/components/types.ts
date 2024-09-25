import type { Snippet } from "svelte";
import type { HTMLAttributes } from "svelte/elements";
import type {
	Direction,
	PaneOnCollapse,
	PaneOnExpand,
	PaneOnResize,
	PaneResizeHandleOnDragging,
} from "$lib/internal/types.js";
import type { PaneGroupStorage } from "$lib/internal/utils/storage.js";

type Primitive<T> = Omit<T, "id" | "children"> & { id?: string | undefined };

export type Without<T extends object, U extends object> = Omit<T, keyof U>;

export type WithChild<
	/**
	 * The props that the component accepts.
	 */
	Props extends Record<PropertyKey, unknown> = {},
	/**
	 * The props that are passed to the `child` and `children` snippets. The `ElementProps` are
	 * merged with these props for the `child` snippet.
	 */
	SnippetProps extends Record<PropertyKey, unknown> = { _default: never },
	/**
	 * The underlying DOM element being rendered. You can bind to this prop to
	 * programatically interact with the element.
	 */
	Ref = HTMLElement,
> = Omit<Props, "child" | "children"> & {
	child?: SnippetProps extends { _default: never }
		? Snippet<[{ props: Record<string, unknown> }]>
		: Snippet<[SnippetProps & { props: Record<string, unknown> }]>;
	children?: SnippetProps extends { _default: never } ? Snippet : Snippet<[SnippetProps]>;
	style?: string | null | undefined;
	ref?: Ref | null | undefined;
};

export type PrimitiveDivAttributes = Primitive<HTMLAttributes<HTMLDivElement>>;

export type PanePropsWithoutHTML = WithChild<{
	/**
	 * The size of the pane when it is in a collapsed state.
	 */
	collapsedSize?: number;

	/**
	 * Whether the pane can be collapsed.
	 *
	 * @defaultValue `false`
	 */
	collapsible?: boolean;

	/**
	 * The default size of the pane in percentage.
	 */
	defaultSize?: number;

	/**
	 * The maximum size of the pane in percentage of the group's size.
	 *
	 * @defaultValue `100`
	 */
	maxSize?: number;

	/**
	 * The minimum size of the pane in percentage of the group's size.
	 *
	 * @defaultValue `0`
	 */
	minSize?: number;

	/**
	 * The order of the pane in the group.
	 * Useful for maintaining order when conditionally rendering panes.
	 */
	order?: number;

	/**
	 * A callback that is called when the pane is collapsed.
	 */
	onCollapse?: PaneOnCollapse;

	/**
	 * A callback that is called when the pane is expanded.
	 */
	onExpand?: PaneOnExpand;

	/**
	 * A callback that is called when the pane is resized.
	 */
	onResize?: PaneOnResize;
}>;

export type PaneProps = PanePropsWithoutHTML &
	Without<PrimitiveDivAttributes, PanePropsWithoutHTML>;

export type PaneGroupPropsWithoutHTML = WithChild<{
	/**
	 * The id to save the layout of the panes to in local storage.
	 */
	autoSaveId?: string | null;

	/**
	 * The direction of the panes.
	 *
	 * @required
	 */
	direction: Direction;

	/**
	 * The amount of space to add to the pane group when the keyboard
	 * resize event is triggered.
	 */
	keyboardResizeBy?: number | null;

	/**
	 * A callback called when the layout of the panes within the group changes.
	 */
	onLayoutChange?: (layout: number[]) => void | null;

	/**
	 * The storage object to use for saving the layout of the panes in the group.
	 */
	storage?: PaneGroupStorage;
}>;

export type PaneGroupProps = PaneGroupPropsWithoutHTML &
	Without<PrimitiveDivAttributes, PaneGroupPropsWithoutHTML>;

export type PaneResizerPropsWithoutHTML = WithChild<{
	/**
	 * Whether the resize handle is disabled.
	 *
	 * @defaultValue `false`
	 */
	disabled?: boolean;

	/**
	 * A callback that is called when the resize handle is being dragged.
	 */
	onDraggingChange?: PaneResizeHandleOnDragging;

	/**
	 * The tabIndex of the resize handle.
	 */
	tabIndex?: number;
}>;

export type PaneResizerProps = PaneResizerPropsWithoutHTML &
	Without<PrimitiveDivAttributes, PaneResizerPropsWithoutHTML>;

export type PaneAPI = {
	/* Collapse the panee to its minimum size */
	collapse: () => void;
	/* Expand the pane to its previous size */
	expand: () => void;
	/* Get the pane's id */
	getId: () => string;
	/** Get the panes size */
	getSize: () => number;
	/** Check if the pane is collapsed */
	isCollapsed: () => boolean;
	/** Check if the pane is expanded */
	isExpanded: () => boolean;
	/** Resize the pane to the specified size */
	resize: (size: number) => void;
};

export type PaneGroupAPI = {
	/** Get the ID of the PaneGroup */
	getId: () => string;
	/** Get the layout of the PaneGroup */
	getLayout: () => number[];
	/** Set the layout of the PaneGroup */
	setLayout: (layout: number[]) => void;
};

/**
 * Data attributes applied to the element rendered by
 * the [Pane](https://paneforge.com/docs/components/pane) component.
 */
export type PaneAttributes = {
	/** Applied to every pane element. */
	"data-pane": string;
	/** The ID of the pane. */
	"data-pane-id": string;
	/** The ID of the pane's group. */
	"data-pane-group-id": string;
};

export type PaneGroupAttributes = {
	/** Applied to every pane group element. */
	"data-pane-group": string;
	/** The direction of the pane group. */
	"data-direction": Direction;
	/** The ID of the pane group. */
	"data-pane-group-id": string;
};

export type PaneResizerAttributes = {
	/** Applied to all resizer elements */
	"data-pane-resizer": string;
	/** The direction of the pane group the resize handle belongs to. */
	"data-direction": Direction;
	/** The ID of the pane group the resize handle belongs to. */
	"data-pane-group-id": string;
	/** Whether the resize handle is active or not. */
	"data-active"?: "pointer" | "keyboard";
	/** Whether the resize handle is enabled or not. */
	"data-enabled"?: boolean;
	/** The ID of the resize handle. */
	"data-pane-resizer-id": string;
};
