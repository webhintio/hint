import * as url from 'url'; // eslint-disable-line no-unused-vars

/** The builder of a given Rule */
export interface RuleBuilder {
    /** Creates an instance of the rule. */
    create(config: Object): Rule;
    /** The metadata associated to the rule (docs, schema, etc.) */
    meta: {
        /** Documentation related to the rule */
        docs?: any,
        /** If this rule can autofix the issue or not */
        fixable?: string,
        /** The schema the rule configuration must follow in order to be valid */
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
    collect(target: url.Url): Promise<Array<Object>>;
    /** The DOM of the page once it is loaded */
    dom: HTMLElement;
    /** The original HTML of the resource collected */
    html: string;
    /** The headers from the response if applicable */
    headers: object;
    /** A way for you to make requests if needed */
    fetchContent(target: URL | string, customHeaders?: object): Promise<NetworkData>;
}

/** The response of fetching an item using the request of a collector */
export interface NetworkData {
    body: string;
    headers: object;
    originalBytes?: Uint8Array, // TODO: is this the right type?
    statusCode: number
}

export interface Config {
    sonarConfig?
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
export type Resource = CollectorBuilder | Formatter | PluginBuilder | RuleBuilder; // eslint-disable-line no-unused-vars

/** An alias for url.Url */
export type URL = url.Url; // eslint-disable-line no-unused-vars

export interface Page {
    /** The document of page  */
    dom: HTMLElement,
    /** The original HTML string of the resource */
    html: string,
    /** The response headers obtained when requesting the page */
    responseHeaders?: object
}

/** A problem found by a Rule in Sonar */
export interface Problem {
    /** The column number where the Problem is */
    column: number,
    /** The line number where the Problem is */
    line: number,
    /** A message providing more information about the Problem */
    message: string,
    /** The uri of the resource firing this event */
    resource: string,
    /** The name of the triggered rule */
    ruleId: string,
    /** The severity of the rule based on the actual configuration */
    severity: Severity
}

/** The severity configuration of a Rule */
export enum Severity {
    off = 0,
    warning = 1,
    error = 2
}

/** The location of a Problem in the code */
export interface ProblemLocation {
    /** The column number where a Problem is */
    column: number,
    /** The line number where a Problem is */
    line: number
}

/** The object emited by a collector on `fetch::end` */
export interface FetchEndEvent {
    /** The uri of the resource firing this event */
    resource: string,
    /** The HTMLElement that started the fetch */
    element: HTMLElement,
    /** The content of target in the url or href of element */
    content: string,
    /** The headers of the response */
    headers: object
}

/** The object emited by a collector on `element::TYPEOFELEMENT` */
export interface ElementFoundEvent {
    /** The uri of the resource firing this event */
    resource: string,
    /** The HTMLElement found */
    element: HTMLElement
}
