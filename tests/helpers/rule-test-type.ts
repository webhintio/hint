import { IProblemLocation } from '../../src/lib/types';

export interface Report {
    /** The message to validate */
    message: string,
    position?: IProblemLocation
}

export interface RuleTest {
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
}
