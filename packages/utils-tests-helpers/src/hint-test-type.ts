import { ExecutionContext } from 'ava';

import { ProblemLocation } from 'hint';

export type MatchProblemLocation = {
    /** A substring matching the location of the problem. */
    match: string;
    range?: string;
};

export type Report = {
    /** The message to validate */
    message: string;
    position?: ProblemLocation | MatchProblemLocation;
};

export type HintTest = {
    /** The code to execute before `closing` the connector. */
    after?(): void | Promise<void>;
    /** The code to execute before creating the connector. */
    before?(): void | Promise<void>;
    /** The name of the test. */
    name: string;
    /** The expected results of the execution. */
    reports?: Report[];
    /** The configuration `test-server` should use. */
    serverConfig?: any;
    /** The url to `executeOn` if different than `localhost`. */
    serverUrl?: string;
    /** Whether this test should be skipped. */
    skip?: boolean;
};

export type HintLocalTest = {
    /** The code to execute before `closing` the connector. */
    after?(context?: ExecutionContext<any>): void | Promise<void>;
    /** The code to execute before creating the connector. */
    before?(context?: ExecutionContext<any>): void | Promise<void>;
    /** Path to send to the local connector. */
    path: string;
    /** The name of the test. */
    name: string;
    /** The expected results of the execution. */
    reports?: Report[];
};
