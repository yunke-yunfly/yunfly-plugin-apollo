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
  // serviceName: 'example-apollo-service',
  // serviceUrl: 'http://xxx.com',
  // secret: 'xxxxxx',
  // namespace: 'application'
}
```

## config options

### interface 

```ts
export interface ApolloConfig {
  enable?: boolean;
  secret?: string;
  serviceUrl?: string;
  namespace?: string;
  serviceName?: string;
}
```

### description

| field | type | required | default | notes |
| ------ | ------ |------ |------ | ------ |
| enable | `boolean` | yes | `false` | enable the plugin |
| secret | `string` | no | `process.env.APOLLO_ACCESSKEY_SECRET` | apollo secret |
| serviceUrl | `string` | no | `process.env.APOLLO_META_SERVER_URL` | apollo host url |
| namespace | `string` | no | `application` | apollo config namespace |
| serviceName | `string` | no | `packageJson.name` |  |


## api

- getApolloConfig

api usage

```ts
import { getApolloConfig } from '@yunflyjs/yunfly-plugin-apollo';

console.log('getApolloConfig',getApolloConfig);
```

- get apollo config in controller

```ts
import { Controller, Get } from '@yunflyjs/yunfly';
import { getApolloConfig } from '@yunflyjs/yunfly-plugin-apollo';
 
@Controller()
export class ExampleController {
  @Get('/users')
  getApolloConfig() {
    return getApolloConfig();
  }
}
```

## env

### process.env.APOLLO_META_SERVER_URL

apollo url host address, need to start with http:// or https://.

- priority

`config.apollo.serviceUrl` > `process.env.APOLLO_META_SERVER_URL`

### process.env.APOLLO_ACCESSKEY_SECRET

if the apollo management side has enabled the secret key, this parameter needs to be passed.

- priority

`config.apollo.secret` > `process.env.APOLLO_ACCESSKEY_SECRET`

## 其他说明

1. apollo hot update
2. failed to retry 5 times



