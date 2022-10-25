import React from 'react';

export interface Node {
  id: string | number;
  name: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data?: any;

  children?: Node[];

  expanded?: boolean;
  disabled?: boolean;
  selected?: boolean;
  selectable?: boolean;
}

export type NodeState = {
  expanded: boolean;
  depth: number;
  selected: boolean;
  disabled: boolean;
  selectable: boolean;
  parent: Node | null;
};

export type RenderOptions = Partial<{
  childClassName: string;
  expandTool: React.ReactNode;
  collapseTool: React.ReactNode;
  indentWidth: number;
}>;

export type ChildRenderer = (
  node: Node,
  state: NodeState,
  props: TreeProps,
  callbacks: {
    expand: (node: Node) => void;
    collapse: (node: Node) => void;
    select: (node: Node) => void;
    deselect: (node: Node) => void;
  }
) => JSX.Element;
export type FilterFn = (node: Node, filter: string) => boolean;

export interface TreeProps {
  data: Node[];
  className?: string;
  childRenderer?: ChildRenderer;
  renderOptions?: RenderOptions;
  virtual?: boolean;

  onExpand?: (node: Node) => void;
  onCollapse?: (node: Node) => void;

  selectable?: boolean;
  multiSelect?: boolean;
  onSelect?: (node: Node) => void;
  onDeselect?: (node: Node) => void;

  disabled?: boolean;

  filterable?: boolean;
  filter?: string;
  filterFn?: FilterFn;
}

export type TreeType = React.FC<TreeProps>;
