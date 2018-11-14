import { ChildNode } from 'postcss';
import { Identifier } from './types-mdn.temp'; // Temporal
import { ProblemLocation } from 'hint/dist/src/lib/types';

export type MDNTreeFilteredByBrowsers = Identifier;

export type BrowserSupportCollection = {
    [key: string]: number[];
};

export type FeatureStrategy<T extends ChildNode> = {
    check: (node: T | ChildNode) => boolean;
    testFeature: (node: T, data: MDNTreeFilteredByBrowsers, browsers: BrowserSupportCollection, location?: ProblemLocation) => void;
};

export type CSSTestFunction = (browsersToSupport: BrowserSupportCollection, browserToSupportName: string, browserInfo: any, featureName: string, prefix?: string, location?: ProblemLocation) => void;

export type StrategyData = {
    prefix: string | undefined;
    featureName: string;
    featureInfo: any;
};
