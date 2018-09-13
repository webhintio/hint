import { Problem } from './problems';
import { UserConfig, HintResources } from '../types';

export type FormatterOptions = {
    config?: UserConfig;
    isScanner?: boolean;
    noGenerateFiles?: boolean;
    resources?: HintResources;
    scanTime?: number;
    status?: string;
    timeStamp?: number;
    version?: string;
};

export interface IFormatterConstructor {
    new(): IFormatter;
}

/** A format function that will output the results obtained by hint */
export interface IFormatter {
    format(problems: Array<Problem>, target: string, options: FormatterOptions): void;
}
