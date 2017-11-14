import { IProblem } from './problems';

/** A format function that will output the results obtained by sonarwhal */
export interface IFormatter {
    format(problems: Array<IProblem>): void;
}
