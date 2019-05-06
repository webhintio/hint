import { Problem } from '@hint/utils/dist/src/types/problems';
import { UserConfig, HintResources } from '../types';

export type FormatterOptions = {
    config?: UserConfig;
    /** Start time (queued in online scanner) ISO string */
    date?: string;
    isScanner?: boolean;
    noGenerateFiles?: boolean;
    /** The file to use to output the results requested by the user */
    output?: string;
    resources?: HintResources;
    /** The time it took to analyze the URL */
    scanTime?: number;
    status?: string;
    /** The analyzed URL */
    target?: string;
    /** webhint's version */
    version?: string;
};

export interface IFormatterConstructor {
    new(): IFormatter;
}

/** A format function that will output the results obtained by hint */
export interface IFormatter {
    format(problems: Problem[], options?: FormatterOptions): void;
}
