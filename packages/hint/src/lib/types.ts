import { IFormatterConstructor } from './types/formatters';
import { IConnectorConstructor } from './types/connector';
import { IParserConstructor } from './types/parser';
import { IHintConstructor } from './types/hints';

export * from './types/async-html';
export * from './types/connector';
export * from './types/events';
export * from './types/formatters';
export * from './types/network';
export * from './types/problems';
export * from './types/hints';
export * from './types/parser';
export * from './types/schema-validation-result';
/**
 * The configuration of a hint. This could be:
 *
 * * A number to set the severity: `0`, `1`, `2`
 * * A string with the serverity: `off`, `warning`, `error`
 * * An array if it needs to be further configured whose
 *   first item is the severity (`number | string`)
 *
 */
export type HintConfig = number | string | [number | string, any];

/**
 * A hints configuration object:
 *
 * ```json
 * {
 *   "hint1": "error",
 *   "hint2": "warning"
 * }
 * ```
 */
export type HintsConfigObject = {
    [key: string]: HintConfig | Array<HintConfig>;
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
    hints: Array<string>;
};

export type UserConfig = {
    connector?: ConnectorConfig | string;
    extends?: Array<string>;
    parsers?: Array<string>;
    hints?: HintsConfigObject | Array<[string, HintConfig]>;
    browserslist?: string | Array<string>;
    hintsTimeout?: number;
    formatters?: Array<string>;
    ignoredUrls?: Array<IgnoredUrl>;
};

/** A resource required by hint: Connector, Formatter, Hint. */
export type Resource = IConnectorConstructor | IFormatterConstructor | IHintConstructor;

export type CLIOptions = {
    _: Array<string>;
    config: string;
    debug: boolean;
    format: string;
    help: boolean;
    init: boolean;
    ['output-file']: string;
    version: boolean;
    watch: boolean;

    /**
     * formatter name(s) to be used. If provided this will override the config file setting value
     * For more than one formatter, use comma separated, with no spaces values. E.g.: "excel,summary"
     */
    formatters: string;

    /**
     * hint name(s) to be used. If provided this will override the config file setting value
     * For more than one hint, use comma separated, with no spaces values. E.g.: "content-type,axe"
     */
    hints: string;
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

export type HintResources = {
    connector: IConnectorConstructor;
    formatters: Array<IFormatterConstructor>;
    incompatible: Array<string>;
    missing: Array<string>;
    parsers: Array<IParserConstructor>;
    hints: Array<IHintConstructor>;
};
