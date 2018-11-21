import { HintContext } from '../hint-context';
import { HintMetadata } from './hint-meta';

export * from './hint-meta';

export interface IHintConstructor {
    new(context: HintContext): IHint;
    meta: HintMetadata;
}

/** A hint to be executed */
export interface IHint { }
