import type { Config } from '@yunflyjs/yunfly';
import { getPackageJson } from '@yunflyjs/yunfly';
import getApolloConfig, { init } from './core';
import logger from '@yunflyjs/loggers';
import type { ApolloConfig } from './types';

export default async function Apollo(apolloConfig: ApolloConfig, config: Config): Promise<any> {
  const { enable, ...option } = apolloConfig || {};
  if (!enable) {
    return;
  }
  const serviceName = apolloConfig.serviceName || getPackageJson().name.replace(/\//g, '.');
  try {
    const result = await init(serviceName, option);
    config.apolloConfig = getApolloConfig();
    return result;
  } catch (err) {
    logger.window().error({
      msg: 'apollo service startup failed.',
      error: err,
    });
    process.exit(-1);
  }
}
