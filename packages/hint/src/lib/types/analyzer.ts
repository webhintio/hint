import { Problem } from './problems';

export type CreateAnalyzerOptions = {
    watch?: boolean;
    formatters?: string[];
    hints?: string[];
}

export type Target = {
    url: string | URL;
    content?: string;
};

export type Endpoint = string | URL | Target;

export type AnalyzerResult = {
    url: string;
    problems: Problem[];
};

export type AnalyzerTargetStart = {
    url: string;
};

export type AnalyzerTargetEnd = AnalyzerTargetStart & {
    problems: Problem[];
};

export type AnalyzerTargetUpdate = AnalyzerTargetStart & {
    message: string;
    resource?: string;
};

export type AnalyzeOptions = {
    targetEndCallback?: (targetEvent: AnalyzerTargetEnd) => Promise<void> | void;
    targetStartCallback?: (targetEvent: AnalyzerTargetStart) => Promise<void> | void;
    updateCallback?: (update: AnalyzerTargetUpdate) => Promise<void> | void;
};
