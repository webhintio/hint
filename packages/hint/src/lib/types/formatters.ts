import { Problem } from './problems';
import { UserConfig, HintResources } from '../types';

export type FormatterOptions = {
    config?: UserConfig;
    /** Start time (queued in online scanner) ISO string */
    date?: string;
    isScanner?: boolean;
    noGenerateFiles?: boolean;
    output?: string;
    resources?: HintResources;
    scanTime?: number;
    status?: string;
    target?: string;
    version?: string;
};

export interface IFormatterConstructor {
    new(): IFormatter;
}

/** A format function that will output the results obtained by hint */
export interface IFormatter {
    format(problems: Problem[], options?: FormatterOptions): void;
}
