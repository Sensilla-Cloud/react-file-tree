# react-file-tree

React-File-Tree is designed to be a kitchen-sink component that you can drop in and forget about.
It does however, come with a multitude of customization options to make it behave like you want.

## Installation

```bash
npm install @sensilla-cloud/react-file-tree
```

or

```bash
yarn add @sensilla-cloud/react-file-tree
```

## Basic Usage

```jsx
import React from 'react';
import FileTree from '@sensilla-cloud/react-file-tree';

const data = [
    {
        id: 1,
        name: 'abc',
        children: [
            {
                id: 2,
                name: 'def'
            },
            {
                id: 3,
                name: 'ghi'
            }
        ]
    }
]

const App = () => (
    <FileTree data={data} />
)
```

You can view the api documentation [here](https://sensilla-cloud.github.io/react-file-tree/)

## License

This project is licensed under the terms of the MIT license.
