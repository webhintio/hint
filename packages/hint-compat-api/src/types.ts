import { ChildNode } from 'postcss';

export type BrowserSupportCollection = {
    [key: string]: number[];
};

export type BrowserSupportCollectionRaw = {
    [key: string]: string[];
};

export type FeatureStrategy<T extends ChildNode> = {
    testFeature: (node: T | ChildNode) => void;
    check: (node: T | ChildNode) => boolean;
};
