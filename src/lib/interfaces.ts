/* eslint-disable no-unused-vars */
import * as url from 'url';

import { ICollectorBuilder } from './interfaces/collectors';
import { IFormatter } from './interfaces/formatters';
import { IPluginBuilder } from './interfaces/plugins';
import { IRuleBuilder } from './interfaces/rules';

export * from './interfaces/asynchtml';
export * from './interfaces/collectors';
export * from './interfaces/events';
export * from './interfaces/formatters';
export * from './interfaces/network';
export * from './interfaces/plugins';
export * from './interfaces/problems';
export * from './interfaces/rules';

export interface IConfig {
    sonarConfig?;
}

/** A resource required by Sonar: Collector, Formatter, Plugin, Rule,  */
export type Resource = ICollectorBuilder | IFormatter | IPluginBuilder | IRuleBuilder;

/** An alias for url.Url */
export type URL = url.Url;
