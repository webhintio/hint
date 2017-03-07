/**
 * @fileoverview Interfaces and enums used in different files in Sonar that do not belong in an specific place.
 * @author Anton Molleda (@molant)
 */

/** The builder of a given Rule */
export interface RuleBuilder {
    /** Creates an instance of the rule. */
    create(config: Object): Rule;
    /** The metadata associated to the rule (docs, schema, etc.) */
    meta: {
        docs?: any,
        fixable?: string,
        schema: Array<any>
    };
}

/** A rule to be executed */
export interface Rule {
    [key: string]: (...values: any[]) => void // TODO: this should be of type Listener, find a way to find it
}

/** The builder of a Collector */
export interface CollectorBuilder {
    (sonar, options): Collector,
}

/** A collector to be used by Sonar */
export interface Collector {
    /** Collects all the information for the given target */
    collect(target: string): Promise<Array<Object>>;
    request;
}

/** A format function that will output the results obtained by Sonar */
export interface Formatter {
    format(problems: Array<Problem>): void
}

/** A specialized builder of plugins to be used by Sonar */
export interface PluginBuilder {
    /** Creates an instance of the Plugin. */
    create(config: Object): Plugin;
}

/** A plugin that expands the collector's functionality */
export interface Plugin {
    // TBD
    any
}

/** A resource required by Sonar: Collector, Formatter, Plugin, Rule,  */
export type Resource = CollectorBuilder | Formatter | PluginBuilder | RuleBuilder;

/** A problem found by a Rule in Sonar */
export interface Problem {
    column: number,
    line: number,
    message: string,
    resource: string,
    ruleId: string,
    severity: Severity
}

/** The severity configuration of a Rule */
export enum Severity {
    off = 0,
    warning = 1,
    error = 2
}

/** The location of a Problem in the code */
export interface Location {
    column: number,
    line: number
}
