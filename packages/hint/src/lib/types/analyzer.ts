import { Problem } from '@hint/utils/dist/src/types/problems';

export type CreateAnalyzerOptions = {
    formatters?: string[];
    hints?: string[];
    language?: string;
    watch?: boolean;
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
    language?: string;
    targetEndCallback?: (targetEvent: AnalyzerTargetEnd) => Promise<void> | void;
    targetStartCallback?: (targetEvent: AnalyzerTargetStart) => Promise<void> | void;
    updateCallback?: (update: AnalyzerTargetUpdate) => Promise<void> | void;
};
