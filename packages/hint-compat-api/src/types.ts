import { ChildNode } from 'postcss';
import { Identifier, SupportStatement, SupportBlock } from './types-mdn.temp'; // Temporal
import { ProblemLocation } from 'hint/dist/src/lib/types';

export type MDNTreeFilteredByBrowsers = Identifier;

export type BrowserSupportCollection = {
    [key: string]: number[];
};

export type FeatureStrategy<T extends ChildNode> = {
    check: (node: T | ChildNode) => boolean;
    testFeature: (node: T, data: MDNTreeFilteredByBrowsers, location?: ProblemLocation) => void;
};

export type TestFeatureFunction = (feature: FeatureInfo, supportBlock: SupportBlock) => void;

export type BrowserVersions = {
    [key: string]: string[];
};

export type FeatureInfo = {
    info: any;
    name: string;
    prefix?: string;
    location?: ProblemLocation;
};

export type BrowsersInfo = {
    name: string;
    supportStatement: SupportStatement;
};

export type SupportStatementResult = {
    groupedBrowserSupport: {[browserName: string]: string[]};
    browsersToSupportCount: number;
    notSupportedBrowsersCount: number;
};
