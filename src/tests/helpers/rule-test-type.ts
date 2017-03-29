import { ProblemLocation } from '../../lib/types';

export interface Report {
    /** The message to validate */
    message: string,
    position?: ProblemLocation
}

export interface RuleTest {
    name: string
    serverConfig: any
    reports?: Array<Report>
}
