import { Event, Events } from 'hint/dist/src/lib/types/events';

export type VueEvents = Events & {
    'parse::end::vue': Event;
    'parse::start::vue': Event;
};
