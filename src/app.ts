
import Apollo from './index';
import type { PluginOptions } from './types';

export { default as getApolloConfig } from './core/index';

/**
 * yunfly apollo plugin
 * @export
 * @param {PluginOptions} {
 *   app,
 *   koaApp,
 *   apolloConfig,
 *   pluginConfig,
 * }
 * @returns {void}
 */
export default async function yunflyPlugin({
  pluginConfig,
  config,
}: PluginOptions): Promise<any> {
  return await Apollo(pluginConfig, config);
}


