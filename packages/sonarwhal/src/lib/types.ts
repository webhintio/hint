import * as url from 'url';

import { IFormatterConstructor } from './types/formatters';
import { IConnectorConstructor } from './types/connector';
import { IParserConstructor } from './types/parser';
import { IRuleConstructor } from './types/rules';

export * from './types/asynchtml';
export * from './types/connector';
export * from './types/events';
export * from './types/formatters';
export * from './types/network';
export * from './types/problems';
export * from './types/rules';
export * from './types/parser';

/**
 * The configuration of a rule. This could be:
 *
 * * A number to set the severity: `0`, `1`, `2`
 * * A string with the serverity: `off`, `warning`, `error`
 * * An array if it needs to be further configured whose
 *   first item is the severity (`number | string`)
 *
 */
export type RuleConfig = number | string | [number | string, any];

/**
 * A rules configuration object:
 *
 * ```json
 * {
 *   "rule1": "error",
 *   "rule2": "warning"
 * }
 * ```
 */
export type RulesConfigObject = {
    [key: string]: RuleConfig | Array<RuleConfig>;
};

export type ConnectorOptionsConfig = {
    waitFor?: number;
    watch?: boolean;
};

export type ConnectorConfig = {
    name: string;
    options?: ConnectorOptionsConfig;
};

export type IgnoredUrl = {
    domain: string;
    rules: Array<string>;
};

export type UserConfig = {
    connector?: ConnectorConfig | string;
    extends?: Array<string>;
    parsers?: Array<string>;
    rules?: RulesConfigObject | Array<[string, RuleConfig]>;
    browserslist?: string | Array<string>;
    rulesTimeout?: number;
    formatters?: Array<string>;
    ignoredUrls?: Array<IgnoredUrl>;
    plugins?: any;
};

/** A resource required by sonarwhal: Connector, Formatter, Rule. */
export type Resource = IConnectorConstructor | IFormatterConstructor | IRuleConstructor;

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

export type ORA = {
    start(): void;
    succeed(): void;
    fail(): void;
    text: string;
};

/**
 * An user in a npm package.
 */
export type NpmMaintainer = {
    email: string;
    username: string;
};

/**
 * The result of a npm search.
 */
export type NpmPackage = {
    date: Date;
    description: string;
    keywords: Array<string>;
    maintainers: Array<NpmMaintainer>;
    name: string;
    version: string;
};

export type SonarwhalResources = {
    connector: IConnectorConstructor;
    formatters: Array<IFormatterConstructor>;
    missing: Array<string>;
    parsers: Array<IParserConstructor>;
    rules: Array<IRuleConstructor>;
};
