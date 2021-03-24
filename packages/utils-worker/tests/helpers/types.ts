import { HintsConfigObject } from '@hint/utils';
import { Problem } from '@hint/utils-types';
import { Resource } from '../../src/shared/types';

export type Test = {
    resources?: Resource[];
    expectedHints?: string[];
    expectedTime?: number;
    hints?: HintsConfigObject;
    html: string;
    name?: string;
    timeout?: number;
};

export type RunResult = {
    problems: Problem[];
    totalTime: number;
};
