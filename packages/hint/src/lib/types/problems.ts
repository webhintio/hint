/** The severity configuration of a hint */
export enum Severity {
    off = 0,
    warning = 1,
    error = 2
}

/** The location of a Problem in the code */
export type ProblemLocation = {
    /** The column number where a Problem is */
    column: number;
    /** The line number where a Problem is */
    line: number;
    /** The column number relative to the element where a Problem is */
    elementColumn?: number;
    /** The line number relative to the element where a Problem is */
    elementLine?: number;
};

/** A problem found by a hint  */
export type Problem = {
    /** The location number where the Problem is */
    location: ProblemLocation;
    /** A message providing more information about the Problem */
    message: string;
    /** The html element where the Problem is */
    sourceCode: string;
    /** The uri of the resource firing this event */
    resource: string;
    /** The name of the triggered hint */
    hintId: string;
    /** The severity of the hint based on the actual configuration */
    severity: Severity;
};
