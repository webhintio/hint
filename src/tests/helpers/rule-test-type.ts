import { IProblemLocation } from '../../lib/interfaces';

export interface Report {
    /** The message to validate */
    message: string,
    position?: IProblemLocation
}

export interface RuleTest {
    name: string
    serverConfig: any
    reports?: Array<Report>
}
