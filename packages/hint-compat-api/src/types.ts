import { ChildNode } from 'postcss';
import { ProblemLocation } from 'hint/dist/src/lib/types';

import { Identifier, SupportStatement, CompatStatement } from './types-mdn.temp'; // Temporal

export type MDNTreeFilteredByBrowsers = Identifier;

export type BrowserSupportCollection = {
    [key: string]: number[];
};

export type TestFeatureOptions = {
    /**
     * Source code to display.
     */
    codeSnippet?: string;
    /**
     * Indicate if the report of a feature has to be skipped
     * This is necessary because in some cases, we just need to
     * check if a feature is valid or not, without reporting it.
     * E.g. when deciding whether to ignore a `@supports` block.
     */
    skipReport?: boolean;
};

export type FeatureStrategy<T extends ChildNode> = {
    check: (node: T | ChildNode) => boolean;
    /**
     * Test if a feature is supported. It will return true if it is supported.
     */
    testFeature: (node: T, location: ProblemLocation | undefined, options?: TestFeatureOptions) => boolean;
};

export type TestFeatureFunction = (feature: FeatureInfo, collection: CompatStatement, options: TestFeatureOptions) => boolean;

export type BrowserVersions = {
    [key: string]: string[];
};

export type FeatureInfo = {
    codeSnippet?: string;
    displayableName?: string;
    location?: ProblemLocation;
    name: string;
    prefix?: string;
    subFeature?: FeatureInfo;
};

export type BrowsersInfo = {
    name: string;
    supportStatement: SupportStatement;
};

export type SupportStatementResult = {
    browsersToSupportCount: number;
    notSupportedBrowsersCount: number;
    notSupportedBrowsers: {[browserName: string]: string[]};
};

export interface ICompatLibrary {
    setResource(resource: string): void;
    reportError(feature: FeatureInfo, message: string): void;
}

export type FeatureAtSupport = {
    property: string;
    value: string;
}
