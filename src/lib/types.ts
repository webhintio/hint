/* eslint-disable no-unused-vars */
import * as url from 'url';

import { ICollectorBuilder } from './types/collector';
import { IFormatter } from './types/formatters';
import { IPluginBuilder } from './types/plugins';
import { IRuleBuilder } from './types/rules';

export * from './types/asynchtml';
export * from './types/collector';
export * from './types/events';
export * from './types/formatters';
export * from './types/network';
export * from './types/plugins';
export * from './types/problems';
export * from './types/rules';

export type RuleConfig = number | string | [number | string, any];

export interface IRuleConfigList {
    [key: string]: RuleConfig | Array<RuleConfig>;
}

export interface ICollectorOptionsConfig {
    waitFor?: number;
    loadCompleteRetryInterval?: number;
    maxLoadWaitTime?: number
}

export interface ICollectorConfig {
    name: string;
    options?: ICollectorOptionsConfig;
}

export interface IIgnoredUrlList {
    [key: string]: Array<string>
}

export interface IConfig {
    collector: ICollectorConfig | string;
    rules?: IRuleConfigList | Array<RuleConfig>;
    browserslist?: string | Array<string>;
    rulesTimeout?: number;
    formatter?: string;
    ignoredUrls?: IIgnoredUrlList;
    plugins?: any;
}

/** A resource required by Sonar: Collector, Formatter, Plugin, Rule. */
export type Resource = ICollectorBuilder | IFormatter | IPluginBuilder | IRuleBuilder;

/** An alias for url.Url. */
export type URL = url.Url;

export type CLIOptions = {
    _: Array<string>,
    config: string,
    debug: boolean,
    format: string,
    help: boolean,
    init: boolean,
    newRule: boolean,
    removeRule: boolean,
    ['output-file']: string,
    version: boolean
};

export interface IORA {
    start(): void;
    succeed(): void;
    fail(): void;
    text: string;
}
