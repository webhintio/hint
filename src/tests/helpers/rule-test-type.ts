import { ProblemLocation } from '../../lib/types';
import { NetworkData } from '../../lib/types';

/** An event to fire while testing rules */
export interface TestEvent {
    /** The name of the event that should be fired.
     *
     * * For HTML elements, the form is `element::elementType::index` where
     * index is optional and represents a number with the index of the element to return.
     */
    name: string,
    /** The network data (i.e. request, response data) that should be returned */
    networkData?: Array<NetworkData>
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
