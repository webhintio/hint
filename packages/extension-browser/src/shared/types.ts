import { Category } from 'hint/dist/src/lib/enums/category';
import { FetchEnd, FetchStart, Problem } from 'hint/dist/src/lib/types';

export type Config = {
    disabledCategories?: string[];
    browserslist?: string;
    ignoredUrls?: string;
};

export type ErrorData = {
    message: string;
    stack: string;
};

export type InjectDetails = {
    config: Config;
}

export type HintResults = {
    helpURL: string;
    id: string;
    name: string;
    problems: Problem[];
};

export type CategoryResults = {
    hints: HintResults[];
    name: Category;
    passed: number;
};

export type Results = {
    categories: CategoryResults[];
};

export type Events = {
    config?: Config;
    enable?: InjectDetails;
    error?: ErrorData;
    fetchEnd?: FetchEnd;
    fetchStart?: FetchStart;
    done?: boolean;
    ready?: boolean;
    requestConfig?: boolean;
    results?: Results;
    tabId?: number;
};
