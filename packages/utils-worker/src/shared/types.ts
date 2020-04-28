import { DocumentData } from '@hint/utils-dom';
import { Problem } from '@hint/utils-types';
import { FetchEnd, FetchStart } from 'hint/dist/src/lib/types';
import { UserConfig } from '@hint/utils';
import { Severity } from '@hint/utils-types';

export type Config = {
    defaultHintSeverity?: keyof typeof Severity;
    resource: string;
    userConfig?: UserConfig;
};

export type ErrorData = {
    message: string;
    stack: string;
};

export type HostEvents = {
    config?: Config;
    fetchEnd?: FetchEnd;
    fetchStart?: FetchStart;
    snapshot?: DocumentData;
};

export type WorkerEvents = {
    done?: true;
    error?: ErrorData;
    ready?: true;
    requestConfig?: true;
    results?: Problem[];
};
