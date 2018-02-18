import * as url from 'url';

import { IConnectorBuilder } from './types/connector';
import { IFormatter } from './types/formatters';
import { IPluginBuilder } from './types/plugins';
import { IRuleBuilder } from './types/rules';

export * from './types/asynchtml';
export * from './types/connector';
export * from './types/events';
export * from './types/formatters';
export * from './types/network';
export * from './types/plugins';
export * from './types/problems';
export * from './types/rules';
export * from './types/parser';
export * from './types/typescriptconfig';

export type RuleConfig = number | string | [number | string, any];

export interface IRuleConfigList {
    [key: string]: RuleConfig | Array<RuleConfig>;
}

export interface IConnectorOptionsConfig {
    waitFor?: number;
}

export interface IConnectorConfig {
    name: string;
    options?: IConnectorOptionsConfig;
}

export type IgnoredUrl = {
    domain: string;
    rules: Array<string>;
};

export interface IConfig {
    connector: IConnectorConfig | string;
    parsers?: Array<string>;
    rules?: IRuleConfigList | Array<RuleConfig>;
    browserslist?: string | Array<string>;
    rulesTimeout?: number;
    formatters?: Array<string>;
    ignoredUrls?: Array<IgnoredUrl>;
    plugins?: any;
    watch?: boolean;
}

/** A resource required by sonarwhal: Connector, Formatter, Plugin, Rule. */
export type Resource = IConnectorBuilder | IFormatter | IPluginBuilder | IRuleBuilder;

/** An alias for url.Url. */
export type URL = url.Url;

export type CLIOptions = {
    _: Array<string>;
    config: string;
    debug: boolean;
    format: string;
    help: boolean;
    init: boolean;
    newParser: boolean;
    newRule: boolean;
    removeRule: boolean;
    ['output-file']: string;
    version: boolean;
    watch: boolean;
};

export interface IORA {
    start(): void;
    succeed(): void;
    fail(): void;
    text: string;
}
