import { IFormatterConstructor } from './types/formatters';
import { IConnectorConstructor } from './types/connector';
import { IParserConstructor } from './types/parser';
import { IHintConstructor } from './types/hints';
import { Severity } from './types/problems';

export * from './types/async-html';
export * from './types/connector';
export * from './types/events';
export * from './types/formatters';
export * from './types/json-parser';
export * from './types/network';
export * from './types/problems';
export * from './types/hints';
export * from './types/parser';
export * from './types/schema-validation-result';

/**
 * The `Severity` of a hint.
 * Can be represented as a number: `0`, `1`, `2`
 * or as a severity string: `off`, `warning`, `error`
 */
export type HintSeverity = Severity | keyof typeof Severity;

/**
 * The configuration of a hint. This could be:
 *
 * * A number to set the severity: `0`, `1`, `2`
 * * A string with the severity: `off`, `warning`, `error`
 * * An array if it needs to be further configured whose
 *   first item is the severity (`number | string`)
 *
 */
export type HintConfig = HintSeverity | [HintSeverity, any];

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
    [key: string]: HintConfig | HintConfig[];
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
    hints: string[];
};

export type UserConfig = {
    connector?: ConnectorConfig | string;
    extends?: string[];
    parsers?: string[];
    hints?: HintsConfigObject | [HintSeverity, HintConfig][];
    browserslist?: string | string[];
    hintsTimeout?: number;
    formatters?: string[];
    ignoredUrls?: IgnoredUrl[];
};

/** A resource required by hint: Connector, Formatter, Hint. */
export type Resource = IConnectorConstructor | IFormatterConstructor | IHintConstructor;

export type CLIOptions = {
    _: string[];
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
    keywords: string[];
    maintainers: NpmMaintainer[];
    name: string;
    version: string;
};

export type NpmPackageResult = {
    package: NpmPackage;
};

export type NpmSearchResults = {
    objects: NpmPackageResult[];
    total: number;
};

export type HintResources = {
    connector: IConnectorConstructor | null;
    formatters: IFormatterConstructor[];
    incompatible: string[];
    missing: string[];
    parsers: IParserConstructor[];
    hints: IHintConstructor[];
};

/**
 * Get just the `string` keys of `T` as `keyof T` can be `string | number | symbol`.
 * https://github.com/Microsoft/TypeScript/issues/23724#issuecomment-384807714
 */
export type StringKeyOf<T> = Extract<keyof T, string>;
