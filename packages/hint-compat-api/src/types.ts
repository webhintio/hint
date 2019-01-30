import { ChildNode } from 'postcss';
import { ProblemLocation } from 'hint/dist/src/lib/types';

import { Identifier, SupportStatement, CompatStatement } from './types-mdn.temp'; // Temporal

export type MDNTreeFilteredByBrowsers = Identifier;

export type BrowserSupportCollection = {
    [key: string]: number[];
};

export type FeatureStrategy<T extends ChildNode> = {
    check: (node: T | ChildNode) => boolean;
    testFeature: (node: T, location?: ProblemLocation) => void;
};

export type TestFeatureFunction = (feature: FeatureInfo, collection: CompatStatement) => boolean;

export type BrowserVersions = {
    [key: string]: string[];
};

export type FeatureInfo = {
    name: string;
    prefix?: string;
    location?: ProblemLocation;
    displayableName?: string;
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
    reportError(feature: FeatureInfo, message: string): Promise<void>;
}
