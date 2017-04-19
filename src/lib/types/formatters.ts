import { IProblem } from './problems'; //eslint-disable-line no-unused-vars

/** A format function that will output the results obtained by Sonar */
export interface IFormatter {
    format(problems: Array<IProblem>): void;
}
