/** The severity configuration of a Rule */
export enum Severity {
    off = 0,
    warning = 1,
    error = 2
}

/** A problem found by a Rule in Sonar */
export interface IProblem {
    /** The location number where the Problem is */
    location: IProblemLocation;
    /** A message providing more information about the Problem */
    message: string;
    /** The html element where the Problem is */
    sourceCode: string;
    /** The uri of the resource firing this event */
    resource: string;
    /** The name of the triggered rule */
    ruleId: string;
    /** The severity of the rule based on the actual configuration */
    severity: Severity;
}

/** The location of a Problem in the code */
export interface IProblemLocation {
    /** The column number where a Problem is */
    column: number;
    /** The line number where a Problem is */
    line: number;
    /** The column number relative to the element where a Problem is */
    elementColumn?: number;
    /** The line number relative to the element where a Problem is */
    elementLine?: number;
}
