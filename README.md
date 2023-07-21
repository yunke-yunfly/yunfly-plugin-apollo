# @yunflyjs/yunfly-plugin-apollo

yunfly apollo plugin.

## Usage

1. install

```bash
yarn add @yunflyjs/yunfly-plugin-apollo
```

2. declare plugins in **config/config.plugin.ts**

```ts
/**
 * yunfly plugin
 */
const plugins: {[key:string]: string}[] = [
  {
    name: 'apollo',
    package: '@yunflyjs/yunfly-plugin-apollo',
    lifeHook: 'beforeStart'
  }
];
// 
export default plugins;
```

3. enable plugins in **config/config.default.ts**

```js
config.apollo = {
  enable: true,
}
```






