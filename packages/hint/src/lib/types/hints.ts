import { Category } from '../enums/category';
import { HintScope } from '../enums/hintscope';
import { HintContext } from '../hint-context';

export type MetadataDocs = {
    category?: Category;
    description: string;
};

export type HintMetadata = {
    /** Documentation related to the hint */
    docs?: MetadataDocs;
    /** The id of the hint */
    id: string;
    /** List of connectors that should not run the hint */
    ignoredConnectors?: Array<string>;
    /** The schema the hint configuration must follow in order to be valid */
    schema: Array<any>; // TODO: this shouldn't be an Array of any
    /** The scope of the hints (local, site, any) */
    scope: HintScope;
};

export interface IHintConstructor {
    new(context: HintContext): IHint;
    meta: HintMetadata;
}

/** A hint to be executed */
export interface IHint { }
