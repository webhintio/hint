import { ChildNode } from 'postcss';
import { Identifier } from './types-mdn.temp'; // Temporal

export type MDNTreeFilteredByBrowsers = Identifier;

export type BrowserSupportCollection = {
    [key: string]: number[];
};

export type FeatureStrategy<T extends ChildNode> = {
    check: (node: T | ChildNode) => boolean;
    testFeature: (node: T, data: MDNTreeFilteredByBrowsers, browsers: BrowserSupportCollection, resource: string) => void;
};

export type CSSTestFunction = (key: string, name: string, data: MDNTreeFilteredByBrowsers, browsers: BrowserSupportCollection, resource: string, children?: string) => void;
