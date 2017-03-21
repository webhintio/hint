import { ProblemLocation } from '../../lib/types';
import { FetchResponse } from '../../lib/types';

/** An event to fire while testing rules */
export interface TestEvent {
    /** The name of the event that should be fired.
     *
     * * For HTML elements, the form is `element::elementType::index` where
     * index is optional and represents a number with the index of the element to return.
     */
    name: string,
    /** The path to the fixture to use when sending the event */
    fixture: string,
    /** The response data that should be returned */
    responses?: Array<FetchResponse>
}

export interface Report {
    /** The message to validate */
    message: string,
    position?: ProblemLocation
}

export interface RuleTest {
    name: string
    events: Array<TestEvent>
    report?: Report
}
