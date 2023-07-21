import type { Config, KoaApp } from '@yunflyjs/yunfly';

export type AnyOptionConfig = Record<string, any>;

export type ApolloConfig_ = Record<string, any>;

export interface PluginOptions {
  app: any;
  koaApp: KoaApp;
  apolloConfig: ApolloConfig_;
  pluginConfig: AnyOptionConfig;
  config: Config;
}

export interface ApolloConfig {
  enable?: boolean;
  secret?: string;
  serviceUrl?: string;
  namespace?: string;
  serviceName?: string;
}

export type Configurations = Record<string, string>;

export interface ApolloOption {
  clusterName?: string;
  namespaceName?: string;
}

export interface ResApolloConfig {
  configurations: Configurations
}
export interface NotificationsItem {
  namespaceName: string;
  notificationId: number;
}
export type Notifications = NotificationsItem[];