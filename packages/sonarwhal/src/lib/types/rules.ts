import { Category } from '../enums/category';
import { RuleScope } from '../enums/rulescope';
import { RuleContext } from '../rule-context';

export type MetadataDocs = {
    category?: Category;
    description: string;
};

export type RuleMetadata = {
    /** Documentation related to the rule */
    docs?: MetadataDocs;
    /** The id of the rule */
    id: string;
    /** List of connectors that should not run the rule */
    ignoredConnectors?: Array<string>;
    /** The schema the rule configuration must follow in order to be valid */
    schema: Array<any>; // TODO: this shouldn't be an Array of any
    /** The scope of the rules (local, site, any) */
    scope: RuleScope;
};

export interface IRuleConstructor {
    new(context: RuleContext): IRule;
    meta: RuleMetadata;
}

/** A rule to be executed */
export interface IRule { }
