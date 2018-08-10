import { Problem } from './problems';
import { UserConfig } from '../types';

export type FormatterOptions = {
    isScanner?: boolean;
    noGenerateFiles?: boolean;
    scanTime?: number;
    status?: string;
    version?: string;
    config?: UserConfig;
};

export interface IFormatterConstructor {
    new(): IFormatter;
}

/** A format function that will output the results obtained by hint */
export interface IFormatter {
    format(problems: Array<Problem>, target: string, options: FormatterOptions): void;
}
