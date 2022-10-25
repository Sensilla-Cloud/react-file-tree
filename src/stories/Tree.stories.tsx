import RealTree from '..';
import React from 'react';
import '../tree.scss';
import { ComponentStory } from '@storybook/react';
import { Node, TreeProps } from '..';
import '@fortawesome/fontawesome-free/css/all.css';
import Docs from './Docs.mdx';

export default {
  title: 'Tree',
  component: RealTree,
  argTypes: {
    dataSize: {
      options: ['small', 'medium', 'large'],
      control: { type: 'radio' }
    },
    onExpand: { action: 'expanded' },
    onCollapse: { action: 'collapse' },
    onSelect: { action: 'select' },
    onDeselect: { action: 'deselect' }
  },
  parameters: {
    docs: {
      page: Docs
    }
  }
};

const smallData = [...Array(5)].map((_, i) => {
  return {
    id: i,
    name: i.toString(),
    children: [...Array(5)].map((_, j) => {
      return {
        id: `${i}-${j}`,
        name: `${i}-${j}`,
        children: []
      };
    })
  };
});

const mediumData = [...Array(50)].map((_, i) => {
  return {
    id: i,
    name: i.toString(),
    children: [...Array(50)].map((_, j) => {
      return {
        id: `${i}-${j}`,
        name: `${i}-${j}`,
        children: [...Array(50)].map((_, k) => {
          return {
            id: `${i}-${j}-${k}`,
            name: `${i}-${j}-${k}`,
            children: []
          };
        })
      };
    })
  };
});

const largeData = (depth: number, parent: string): Node[] => {
  if (depth === 0) {
    return [];
  }
  return [...Array(100)].map((_, i) => {
    const newParent = parent !== '' ? `${parent}-${i}` : `${i}`;
    return {
      id: `${parent}-${depth}-${i}`,
      name: newParent,
      children: largeData(depth - 1, newParent)
    };
  });
};

const generateData = (size: string) => {
  if (size === 'small') {
    return smallData;
  } else if (size === 'medium') {
    return mediumData;
  } else {
    return largeData(3, '');
  }
};

const Tree = ({
  dataSize,
  ...args
}: { dataSize: string } & Partial<TreeProps>) => {
  const data = generateData(dataSize);
  return <RealTree data={data} {...args} />;
};

const DefaultArgs = {
  dataSize: 'small',
  disabled: false,
  selectable: true,
  multiSelect: false
};

export const Basic: ComponentStory<typeof Tree> = (args) => {
  return <Tree {...args} />;
};

Basic.args = DefaultArgs;

export const CustomFoldIcons: ComponentStory<typeof Tree> = (args) => {
  return (
    <Tree
      {...args}
      renderOptions={{
        expandTool: <i className="fas fa-arrow-right"></i>,
        collapseTool: <i className="fas fa-arrow-down"></i>
      }}
    />
  );
};

CustomFoldIcons.args = DefaultArgs;

export const Virtual: ComponentStory<typeof Tree> = (args) => {
  return <Tree {...args} virtual />;
};

Virtual.args = DefaultArgs;

export const BasicFilter: ComponentStory<typeof Tree> = (args) => {
  const [filter, setFilter] = React.useState('');

  return (
    <>
      <input
        type="text"
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
      ></input>
      <Tree {...args} filterable filter={filter} />
    </>
  );
};

BasicFilter.args = DefaultArgs;

export const CustomFilter: ComponentStory<typeof Tree> = (args) => {
  const [filter, setFilter] = React.useState('');

  return (
    <>
      <input
        type="text"
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
      ></input>
      <Tree
        {...args}
        filterable
        filter={filter}
        filterFn={(node, filter) => {
          return node.name.includes(filter);
        }}
      />
    </>
  );
};

CustomFilter.args = DefaultArgs;

export const CustomNode: ComponentStory<typeof Tree> = (args) => {
  return (
    <Tree
      {...args}
      childRenderer={(node, state, props, callbacks) => {
        return (
          <div>
            <span
              onClick={() => {
                if (props.disabled || state.disabled) return;
                if (node.children?.length) {
                  if (state.expanded) {
                    callbacks.collapse(node);
                  } else {
                    callbacks.expand(node);
                  }
                }
              }}
            >
              {node.name}
            </span>
            <span>
              &nbsp;
              <input
                type="checkbox"
                checked={state.selected}
                onClick={() => {
                  if (props.disabled || state.disabled) return;
                  if (state.selected) {
                    callbacks.deselect(node);
                  } else {
                    callbacks.select(node);
                  }
                }}
              ></input>
            </span>
          </div>
        );
      }}
    />
  );
};

CustomNode.args = DefaultArgs;
