/** The location of a Problem in the code */
export type ProblemLocation = {
    /** The zero-based column number where a Problem is */
    column: number;
    /** The zero-based line number where a Problem is */
    line: number;
    /** The column number relative to the element where a Problem is */
    elementColumn?: number;
    /** The line number relative to the element where a Problem is */
    elementLine?: number;
};
