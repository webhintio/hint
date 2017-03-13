/** The builder of a given Rule */
interface RuleBuilder {
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
interface Rule {
    [key: string]: (...values: any[]) => void // TODO: this should be of type Listener, find a way to find it
}

/** The builder of a Collector */
interface CollectorBuilder {
    (sonar, options): Collector,
}

/** A collector to be used by Sonar */
interface Collector {
    /** Collects all the information for the given target */
    collect(target: Target): Promise<Array<Object>>;
    request;
}

interface Config {
    sonarConfig?
}

/** A format function that will output the results obtained by Sonar */
interface Formatter {
    format(problems: Array<Problem>): void
}

/** A specialized builder of plugins to be used by Sonar */
interface PluginBuilder {
    /** Creates an instance of the Plugin. */
    create(config: Object): Plugin;
}

/** A plugin that expands the collector's functionality */
interface Plugin {
    // TBD
    any
}

/** A resource required by Sonar: Collector, Formatter, Plugin, Rule,  */
type Resource = CollectorBuilder | Formatter | PluginBuilder | RuleBuilder; // eslint-disable-line no-unused-vars

interface Page {
    dom: HTMLElement,
    isLocalFile: boolean,
    responseHeaders?: object
}

/** A problem found by a Rule in Sonar */
interface Problem {
    column: number,
    line: number,
    message: string,
    resource: string,
    ruleId: string,
    severity: Severity
}

/** The severity configuration of a Rule */
enum Severity {
    off = 0,
    warning = 1,
    error = 2
}

/** The location of a Problem in the code */
interface ProblemLocation {
    column: number,
    line: number
}

interface Target {
    path: string,
    type: 'url' | 'file'
}
