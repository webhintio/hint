import { IProblem } from '../../types';

export interface ISummaryResult {
    sequence: Array<string>;
    tableData: Array<Array<string>>;
    totalErrors: number;
    totalWarnings: number;
}

export interface IGroupedProblems {
    [key: string]: Array<IProblem>;
}
