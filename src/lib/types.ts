/* eslint-disable no-unused-vars */
import * as url from 'url';

import { ICollectorBuilder } from './types/collectors';
import { IFormatter } from './types/formatters';
import { IPluginBuilder } from './types/plugins';
import { IRuleBuilder } from './types/rules';

export * from './types/asynchtml';
export * from './types/collectors';
export * from './types/events';
export * from './types/formatters';
export * from './types/network';
export * from './types/plugins';
export * from './types/problems';
export * from './types/rules';

export interface IConfig {
    sonarConfig?;
}

/** A resource required by Sonar: Collector, Formatter, Plugin, Rule. */
export type Resource = ICollectorBuilder | IFormatter | IPluginBuilder | IRuleBuilder;

/** An alias for url.Url. */
export type URL = url.Url;
