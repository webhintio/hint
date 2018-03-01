import { Problem } from './problems';

export interface IFormatterConstructor {
    new(): IFormatter;
}

/** A format function that will output the results obtained by sonarwhal */
export interface IFormatter {
    format(problems: Array<Problem>): void;
}
