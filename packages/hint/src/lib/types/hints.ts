import { HintContext } from '../hint-context';
import { HintMetadata } from './hint-meta';

export * from './hint-meta';

/** A hint to be executed */
export interface IHint { }

export interface IHintConstructor {
    new(context: HintContext): IHint;
    meta: HintMetadata;
}
