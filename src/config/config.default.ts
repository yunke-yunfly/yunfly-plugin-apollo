import type { Config } from '@yunflyjs/yunfly';

/**
 * plugin default config
 *
 * @export
 * @param {KoaApp} app
 * @returns
 */
export default function config(): Config {
  const config: Config = {};

  config.apollo = {
    enable: false,
  };

  return config;
}
