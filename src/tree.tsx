import React from 'react';
import {
  TreeType,
  Node,
  RenderOptions,
  NodeState,
  TreeProps,
  FilterFn
} from './tree.types';
import { useVirtual, List } from '@af-utils/react-virtual-list';

const DefaultRenderOptions: RenderOptions = {
  childClassName: 'react-file-tree-child',
  expandTool: <div className="react-file-tree-child-button">+</div>,
  collapseTool: <div className="react-file-tree-child-button">-</div>,
  indentWidth: 16
};

const TreeDefaultProps: Partial<TreeProps> = {
  className: 'react-file-tree',
  renderOptions: DefaultRenderOptions,
  filterFn: (node: Node, filter: string) =>
    node.name.toLowerCase().includes(filter.toLowerCase())
};

const Tree: TreeType = (givenProps) => {
  const props = Object.assign({}, TreeDefaultProps, givenProps);
  props.renderOptions = Object.assign(
    {},
    DefaultRenderOptions,
    props.renderOptions
  );

  const [nodeState, setNodeState] = React.useState<
    Map<string | number, NodeState>
  >(new Map());
  const [flatNodes, setFlatNodes] = React.useState<Map<string | number, Node>>(
    new Map()
  );
  const [visibleNodes, setVisibleNodes] = React.useState<(string | number)[]>(
    []
  );

  const [selectedNode, setSelectedNode] = React.useState<string | number>();

  const callbacks = {
    expand: (node: Node) => {
      if (props.onExpand) {
        props.onExpand(node);
      }
      setNodeState(
        new Map(
          nodeState.set(node.id, {
            ...(nodeState.get(node.id) as NodeState),
            expanded: true
          })
        )
      );
    },
    collapse: (node: Node) => {
      if (props.onCollapse) {
        props.onCollapse(node);
      }
      setNodeState(
        new Map(
          nodeState.set(node.id, {
            ...(nodeState.get(node.id) as NodeState),
            expanded: false
          })
        )
      );
    },
    select: (node: Node) => {
      if (props.selectable) {
        if (props.onSelect) {
          props.onSelect(node);
        }
        const newNodeState = new Map(
          nodeState.set(node.id, {
            ...(nodeState.get(node.id) as NodeState),
            selected: true
          })
        );
        if (!props.multiSelect) {
          if (selectedNode !== undefined) {
            newNodeState.set(selectedNode, {
              ...(newNodeState.get(selectedNode) as NodeState),
              selected: false
            });
          }
          setSelectedNode(node.id);
        }
        setNodeState(newNodeState);
      }
    },
    deselect: (node: Node) => {
      if (props.selectable) {
        if (props.onDeselect) {
          props.onDeselect(node);
        }
        setNodeState(
          new Map(
            nodeState.set(node.id, {
              ...(nodeState.get(node.id) as NodeState),
              selected: false
            })
          )
        );
        if (!props.multiSelect) {
          setSelectedNode(undefined);
        }
      }
    }
  };

  const renderNode = React.useCallback(
    (node: Node, state: NodeState): React.ReactNode[] => {
      if (
        node === undefined ||
        (props.filterable && !visibleNodes.includes(node.id))
      ) {
        return [];
      }
      return [
        typeof givenProps.childRenderer === 'function'
          ? givenProps.childRenderer(node, state, props, callbacks)
          : DefaultRender(node, state, props.renderOptions as RenderOptions),
        ...(node.children && state.expanded
          ? Array.from(
              node.children.map((child) =>
                renderNode(child, nodeState.get(child.id) as NodeState)
              )
            ).flat(9999999)
          : [])
      ];
    },
    [nodeState, props.renderOptions, givenProps.childRenderer]
  );

  const RenderVirtual = React.useCallback(
    ({ i, model }: { i: number; model: typeof useVirtual }) => {
      if (!props.data[i] || !nodeState.has(props.data[i].id)) {
        return null;
      }
      return (
        <div
          ref={(el) => model.el(i, el)}
          className={props.className + '-virtual-child-wrapper'}
        >
          {renderNode(
            props.data[i],
            nodeState.get(props.data[i].id) as NodeState
          )}
        </div>
      );
    },
    [props.data, nodeState, visibleNodes]
  );

  const DefaultRender = (
    node: Node,
    state: NodeState,
    options: RenderOptions
  ) => {
    return (
      <div
        key={node.id}
        className={`${options.childClassName}${
          state.expanded ? ` ${options.childClassName}-expanded` : ''
        }${state.selected ? ` ${options.childClassName}-selected` : ''}${
          state.disabled ? ` ${options.childClassName}-disabled` : ''
        }`}
      >
        <div className={options.childClassName + '-row'}>
          <div
            style={{ width: (options.indentWidth as number) * state.depth }}
          ></div>
          {(node.children?.length ?? 0) > 0 && (
            <div
              className={options.childClassName + '-fold-button'}
              onClick={() => {
                if (props.disabled) return;
                const newState = !state.expanded;
                if (newState) {
                  callbacks.expand(node);
                } else if (!newState) {
                  callbacks.collapse(node);
                }
              }}
            >
              {state.expanded ? options.collapseTool : options.expandTool}
            </div>
          )}
          <div
            className={options.childClassName + '-label'}
            style={{
              cursor: props.disabled
                ? 'not-allowed'
                : props.selectable && state.selectable
                ? 'pointer'
                : 'default'
            }}
            onClick={() => {
              if (props.selectable && state.selectable && !props.disabled) {
                const newState = !state.selected;
                if (newState) {
                  callbacks.select(node);
                } else if (!newState) {
                  callbacks.deselect(node);
                }
              }
            }}
          >
            {node.name}
          </div>
        </div>
      </div>
    );
  };

  React.useEffect(() => {
    const localNodeState = new Map<string | number, NodeState>();
    const localFlatNodes = new Map<string | number, Node>();

    const traverse = (node: Node, depth: number, parent: Node | null) => {
      localNodeState.set(node.id, {
        expanded: node.expanded ?? false,
        depth: depth,
        selected: node.selected ?? false,
        disabled: node.disabled ?? false,
        selectable: node.selectable ?? true,
        parent: parent
      });

      localFlatNodes.set(node.id, node);

      node.children?.forEach((child) => {
        traverse(child, depth + 1, node);
      });
    };

    props.data.forEach((node) => {
      traverse(node, 0, null);
    });

    setNodeState(localNodeState);
    setFlatNodes(localFlatNodes);
  }, [givenProps.data]);

  React.useEffect(() => {
    if (props.filterable && props.filter) {
      const localVisibleNodes: (string | number)[] = [];
      const matches: Node[] = [];
      flatNodes.forEach((node) => {
        if ((props.filterFn as FilterFn)(node, props.filter || '')) {
          matches.push(node);
        }
      });
      const traverse = (node: Node) => {
        localVisibleNodes.push(node.id);
        if (nodeState.get(node.id)?.parent !== null) {
          traverse(nodeState.get(node.id)?.parent as Node);
        }
      };
      matches.forEach((node) => {
        traverse(node);
      });
      setVisibleNodes(localVisibleNodes);
    } else if (props.filterable) {
      setVisibleNodes([...flatNodes.keys()]);
    }
  }, [props.filter, props.filterable, flatNodes]);

  const model = useVirtual({
    itemCount: props.data.length
  });

  return (
    <div
      className={`${props.className}${
        props.disabled ? ` ${props.className}-disabled` : ''
      }`}
    >
      {!props.virtual ? (
        props.data.map((node) =>
          nodeState.has(node.id)
            ? renderNode(node, nodeState.get(node.id) as NodeState)
            : null
        )
      ) : (
        <List className={props.className + '-virtual'} model={model}>
          {RenderVirtual}
        </List>
      )}
    </div>
  );
};

export default Tree;
