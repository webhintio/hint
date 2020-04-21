import { Engine } from '../engine';
import { Events } from './events';

export interface IParserConstructor {
    new(engine: Engine): Parser;
}

/** A `Parser` that understands a file content. */
export abstract class Parser<E extends Events = Events> {
    protected engine: Engine<E>;
    protected name: string;

    /* istanbul ignore next */
    public constructor(engine: Engine<E>, parseEventType: string) {
        this.engine = engine;
        this.name = parseEventType;
    }
}
