import { ChildNode } from 'postcss';
import { Identifier, SupportStatement } from './types-mdn.temp'; // Temporal
import { ProblemLocation } from 'hint/dist/src/lib/types';

export type MDNTreeFilteredByBrowsers = Identifier;

export type BrowserSupportCollection = {
    [key: string]: number[];
};

export type FeatureStrategy<T extends ChildNode> = {
    check: (node: T | ChildNode) => boolean;
    testFeature: (node: T, data: MDNTreeFilteredByBrowsers, browsers: BrowserSupportCollection, location?: ProblemLocation) => void;
};

export type CSSTestFunction = (browser: BrowsersInfo, feature: FeatureInfo) => void;

export type BrowserVersions = {
    [key: string]: string[];
};

export type FeatureInfo = {
    featureName: string;
    featureInfo: any;
    prefix?: string | undefined;
    location?: ProblemLocation;
};

export type BrowsersInfo = {
    browsersToSupport: BrowserSupportCollection;
    browserToSupportName: string;
    browserInfo: SupportStatement;
};
