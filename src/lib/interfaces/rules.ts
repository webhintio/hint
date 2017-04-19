/** The builder of a given Rule */
export interface IRuleBuilder {
    /** Creates an instance of the rule. */
    create(config: Object): IRule;
    /** The metadata associated to the rule (docs, schema, etc.) */
    meta: {
        /** Documentation related to the rule */
        docs?: any;
        /** If this rule can autofix the issue or not */
        fixable?: string;
        /** The schema the rule configuration must follow in order to be valid */
        schema: Array<any> | any; // TODO: this shouldn't be an any
        /** If the rule works with local resources (file://...) */
        worksWithLocalFiles: boolean;
    };
}

/** A rule to be executed */
export interface IRule {
    [key: string]: (...values: any[]) => void // TODO: this should be of type Listener, find a way to find it
}
