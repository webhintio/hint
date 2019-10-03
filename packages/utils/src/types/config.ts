import { Severity } from './problems';

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
    browserslist?: string | string[];
    connector?: ConnectorConfig | string;
    extends?: string[];
    formatters?: string[];
    hints?: HintsConfigObject | [HintSeverity, HintConfig][];
    hintsTimeout?: number;
    ignoredUrls?: IgnoredUrl[];
    language?: string;
    parsers?: string[];
    severityThreshold?: HintSeverity;
};
