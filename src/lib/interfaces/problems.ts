/** The severity configuration of a Rule */
export enum Severity {
    off = 0,
    warning = 1,
    error = 2
}

/** A problem found by a Rule in Sonar */
export interface IProblem {
    /** The column number where the Problem is */
    column: number;
    /** The line number where the Problem is */
    line: number;
    /** A message providing more information about the Problem */
    message: string;
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
}
