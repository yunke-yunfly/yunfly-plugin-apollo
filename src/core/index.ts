import Axios from "axios";
import logger from '@yunflyjs/loggers'
import { Access } from "../utils/access";
import type { ApolloConfig, ApolloOption, Configurations, Notifications, ResApolloConfig } from "../types";
import { DEFAULT_CLUSTER, DEFAULT_NAMESPACE, totalErrorRetryContint } from "../const";
import { strHandle } from "../utils/util";

const axios = Axios.create({ timeout: 80000 });
const path = require('path')
const fs = require('fs-extra')
const cluster = require('cluster')

let apolloConfigCache: Configurations;
let defaultApolloOption: Required<ApolloOption> = {
  namespaceName: DEFAULT_NAMESPACE,
  clusterName: DEFAULT_CLUSTER,
}
let notificationCache: Notifications = [
  { namespaceName: defaultApolloOption.namespaceName, notificationId: -1 },
];
let apolloHostUrl: string = process.env.APOLLO_META_SERVER_URL || '';
let apolloSecret: string = process.env.APOLLO_ACCESSKEY_SECRET || '';
let errorRetryCount: number = 0;


async function getNotifications(serviceName: string) {
  const encodeNotifications = encodeURI(JSON.stringify(notificationCache));
  const { clusterName } = defaultApolloOption;
  const url = `${apolloHostUrl}/notifications/v2?appId=${serviceName}&cluster=${clusterName}&notifications=${encodeNotifications}`;
  try {
    const { data } = await axios.get(url, {
      timeout: 120000,
    });
    notificationCache = data;
    await getApolloConfigPromise(serviceName).then(res => {
      apolloConfigCache = res.data.configurations;
      fs.writeJsonSync(path.resolve(__dirname, './apolloConfig.json'), apolloConfigCache)
      getNotifications(serviceName);
    });
  } catch (e: any) {
    const resStatus = e.response && e.response.status;
    if (resStatus === 304) {
      getNotifications(serviceName);
    } else if (resStatus === 401) {
      logger.window().error({
        msg: `Unauthorized Apollo config for: ${serviceName}`,
        secret: strHandle(apolloSecret),
        error: e
      });
    } else {
      logger.window().warn({
        msg: `apollo service startup failed.`,
        error: e
      });
      if (errorRetryCount >= totalErrorRetryContint) { return; }
      errorRetryCount++;
      getNotifications(serviceName);
    }
  }
}

function getApolloConfigPromise(serviceName: string) {
  const url = getApolloUrl(serviceName);
  return axios.get<ResApolloConfig>(url).catch((err) => {
    const resStatus = err.response && err.response.status;
    if (resStatus === 401) {
      logger.window().error({
        url: `apollo request url: ${url}`,
        secret: strHandle(apolloSecret),
        msg: `Unauthorized Apollo config for: ${serviceName}`,
        error: err,
      })
    } else if (resStatus === 404) {
      logger.window().error({
        url: `apollo request url: ${url}`,
        secret: strHandle(apolloSecret),
        msg: `apollo address does not exist or the application has not been published.`,
        error: err,
      })
    }
    throw err;
  });
}

async function initApolloConfig(serviceName: string) {
  getNotifications(serviceName);
  return await getApolloConfigAsync(serviceName);
}

function getApolloUrl(serviceName: string): string {
  const { namespaceName, clusterName } = defaultApolloOption;
  return `${apolloHostUrl}/configs/${serviceName}/${clusterName}/${namespaceName}`
}

export async function init(serviceName: string, option?: ApolloConfig) {
  const beginTime = Date.now();

  if (option?.serviceUrl) apolloHostUrl = option.serviceUrl;

  if (!apolloHostUrl) throw Error('apollo service url cannot be empty, please set process.env.APOLLO_META_SERVER_URL or config.apollo.serviceUrl.')

  if (option?.secret) apolloSecret = option.secret;

  axios.interceptors.request.use(config => {
    if (apolloSecret) {
      const headers = Access.createAccessHeader(serviceName, config.url as string, apolloSecret);
      config.headers = { ...config.headers, ...headers }
    }
    return config;
  });

  if (option?.namespace) {
    defaultApolloOption.namespaceName = option.namespace;
    notificationCache = [
      { namespaceName: defaultApolloOption.namespaceName, notificationId: -1 },
    ]
  }

  // from cache
  const apolloConfig = getApolloConfigFromCache(beginTime);
  if (apolloConfig) {
    initApolloConfig(serviceName).catch((err) => {
      logger.window().error({ msg: 'apollo service startup failed', error: err });
      process.exit(0);
    });
    return apolloConfig;
  }

  // from request url
  const url = getApolloUrl(serviceName);
  try {
    await initApolloConfig(serviceName);
    logger.window().info(`successfully init apollo service, url: ${url}, duration time: ${Date.now() - beginTime}ms`);
  } catch (err: any) {
    logger.window().error({ msg: 'apollo service startup failed', error: err });
    process.exit(0);
  }
  return apolloConfigCache;
}

export default function getApolloConfig(): Configurations {
  if (!apolloConfigCache || cluster.isWorker) {
    try { apolloConfigCache = fs.readJsonSync(path.resolve(__dirname, './apolloConfig.json')) } catch (err) { }
    if (!apolloConfigCache) {
      throw new Error('not get apollo config.');
    }
  }
  return apolloConfigCache;
}

function getApolloConfigFromCache(beginTime: number): Configurations {
  if (apolloConfigCache && !cluster.isWorker) {
    return apolloConfigCache;
  }
  try {
    const cacheFile = path.join(__dirname, './apolloConfig.json');
    const isHave = fs.existsSync(cacheFile);
    if (isHave) {
      apolloConfigCache = fs.readJsonSync(path.resolve(__dirname, './apolloConfig.json'));
      if (apolloConfigCache) {
        logger.window().info(`successfully initialized Apollo service from cache, duration time: ${Date.now() - beginTime}ms`);
        return apolloConfigCache
      }
    }
  } catch (err: any) { }
  return apolloConfigCache;
}

export async function getApolloConfigAsync(
  serviceName: string,
): Promise<Configurations> {
  // from cache
  const beginTime = Date.now();
  const apolloConfig = getApolloConfigFromCache(beginTime);
  if (apolloConfig) {
    return apolloConfig;
  }

  // from request url
  const res = await getApolloConfigPromise(serviceName);
  apolloConfigCache = res.data.configurations;
  fs.writeJsonSync(path.resolve(__dirname, './apolloConfig.json'), apolloConfigCache);
  return apolloConfigCache;
}

