export * from './engine';
export * from './analyzer';
export * from './types';
export * from './config';
export * from './enums';
export * from './hint-context';

import * as allUtils from './utils';

import { Analyzer } from './analyzer';

export const utils = allUtils;
export const createAnalyzer = Analyzer.create;
export const getUserConfig = Analyzer.getUserConfig;
