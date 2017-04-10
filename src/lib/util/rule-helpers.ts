import * as path from 'path';
import * as d from 'debug';

export const getRuleName = (dirname: string) => {
    return path.basename(dirname);
};

export const ruleDebug = (dirname: string) => {
    return d(`sonar:rules:${getRuleName(dirname)}`);
};
