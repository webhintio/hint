import { Category } from '../enums/category';
import { Scope } from '../enums/scope';

export type MetadataDocs = {
    category?: Category;
    description: string;
};

export interface IRuleMetadata {
    /** Documentation related to the rule */
    docs?: MetadataDocs;
    /** List of connectors that should not run the rule */
    ignoredConnectors?: Array<string>;
    /** The schema the rule configuration must follow in order to be valid */
    schema: Array<any>; // TODO: this shouldn't be an Array of any
    /** If the rule works with local resources (file://...) */
    scope: Scope;
}

/** The builder of a given Rule */
export interface IRuleBuilder {
    /** Creates an instance of the rule. */
    create(config: Object): IRule;
    /** The metadata associated to the rule (docs, schema, etc.) */
    meta: IRuleMetadata;
}

/** A rule to be executed */
export interface IRule {
    [key: string]: (...values: Array<any>) => void; // TODO: this should be of type Listener, find a way to find it
}
