## Installation

```bash
yarn && yarn start
```

## Build code

```bash
yarn build
```

If there is problem releated to `babel-preset-react-app` go to `node_modules/babel-preset-react-app` and run `yarn` then try again

or add this into package.json

```json
"nohoist": [
      "**/babel-preset-react-app/@babel/runtime"
]
```

