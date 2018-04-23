import { ProblemLocation } from '../../src/lib/types';

export type Report = {
    /** The message to validate */
    message: string;
    position?: ProblemLocation;
};

export type RuleTest = {
    /** The code to execute before `closing` the connector. */
    after?();
    /** The code to execute before creating the connector. */
    before?();
    /** The name of the test. */
    name: string;
    /** The expected results of the execution. */
    reports?: Array<Report>;
    /** The configuration `test-server` should use. */
    serverConfig?: any;
    /** The url to `executeOn` if different than `localhost`. */
    serverUrl?: string;
};

export type RuleLocalTest = {
    /** The code to execute before `closing` the connector. */
    after?(context?);
    /** The code to execute before creating the connector. */
    before?(context?);
    /** Path to send to the local connector. */
    path: string;
    /** The name of the test. */
    name: string;
    /** The expected results of the execution. */
    reports?: Array<Report>;
};
