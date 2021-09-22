# Events

Information is shared internally via `event`s. `connector`s and `parser`s can
create them, while `parser`s and `hint`s consume them. To add new events via a
`parser`, you must export a type defining the event names and expected values.

```ts
// example.ts
import { Event, Events } from 'hint/dist/src/lib/types/events';
// ...
export type StyleParse = Event & {
    ast: Root;
    code: string;
    element: HTMLElement | null;
};

export type StyleEvents = Events & {
    'parse::end::css': StyleParse;
    'parse::start::css': Event;
};

export default class CSSParser extends Parser<StyleEvents> {
    public constructor(engine: Engine<StyleEvents>) {
        super(engine, 'css');
        // ...
    }
    // ...
}
```

The following is a list of all the events common to all `connector`s, with
their signature, and the `interface` they implement. The exception is the
`local connector` that needs the `HTML parser` to emit these events:

* [`element::<element-type>`](#elementelement-type)
* [`fetch::end::<resource-type>`](#fetchendresource-type)
* [`fetch::error`](#fetcherrorresource-type)
* [`fetch::start`](#fetchstartresource-type)
* [`scan::end`](#scanend)
* [`scan::start`](#scanstart)
* [`traverse::down`](#traversedown)
* [`traverse::end`](#traverseend)
* [`traverse::start`](#traversestart)
* [`traverse::up`](#traverseup)
* [`can-evaluate::script`](#can-evaluatescript)

For additional events emitted by specific `parser`s (e.g. `parse::end::css`),
see [`parsers`][parsers].

## `element::<element-type>`

Event is emitted **when** the `connector` visits an element in the DOM
when traversing it. `<element-type>` is the [`nodeName`][nodeName docs]
lower cased.

**Format:**

```ts
type ElementFound = {
    /** The URI of the resource firing this event. */
    resource: string;
    /** The visited element. */
    element: HTMLElement;
}
```

## `fetch::end::<resource-type>`

Event is emitted **when** the content of a `resource` (`js`, `css`,
`image`, etc.) has finished downloading.

**Format:**

```ts
type FetchEnd = {
    /** The element that initiated the request. */
    element: HTMLElement;
    /** The URL of the target */
    resource: string;
    /** The request made to fetch the target. */
    request: Request;
    /** The response sent while fetching the target. */
    response: Response;
}
```

## `fetch::error::<resource-type>`

Event is emitted **when** a problem downloading the content of
a `resource` was encountered.

**Format:**

```ts
type FetchError = {
    /** The URL of the target. */
    resource: string;
    /** The element that initiated the request. */
    element: HTMLElement;
    /** The error found. */
    error: any;
    /** The redirects performed for the url. */
    hops: string[];
}
```

## `fetch::start::<resource-type>`

Event is emitted **when** the request to fetch the `target` is about
to start

**Format:**

```ts
type FetchStart = {
    /** The URL to download */
    resource: string;
}
```

## `scan::end`

Event is emitted **when** the `connector` has finished sending all
events and its about to return. This is the last event to be emitted.

**Format:**

```ts
type ScanEnd = {
     /** The final URL analyzed. */
    resource: string;
}
```

## `scan::start`

Event is emitted **when** the `connector` is about to start the
analysis. This is the first event to be emitted.

**Format:**

```ts
type ScanStart = {
    /** The URL to analyze. */
    resource: string;
}
```

**Note:** This event is fired synchronously. You should not return
a `Promise` because it will not wait for it to be resolved. If you
need to perform an `async` operation you should combine it with
`scan::end`. You can find more information in [how to interact with
other services](../how-to/common-hint-scenarios.md#interact-with-other-services).

## `traverse::down`

Event is emitted **when** the `connector` is traversing and starts
visiting the children of a node. `element` is the parent node that
is to be traversed.

**Format:**

```ts
type TraverseDown = {
    /** The parent element to be traversed. */
    element: HTMLElement;
    /** The URL of the target. */
    resource: string;
}
```

## `traverse::end`

Event is emitted **when** the `connector` has finished traversing
the DOM entirely.

**Format:**

```ts
type TraverseEnd = {
    /** The URL of the target. */
    resource: string;
}
```

## `traverse::start`

Event is emitted **when** the `connector` is going to start traversing
the DOM.

**Format:**

```ts
type TraverseStart = {
    /** The URL of the target. */
    resource: string;
}
```

## `traverse::up`

Event is emitted **when** the `connector` has finsihed visiting the
children of a node and goes to the next one. `element` is the parent
node that was traversed.

**Format:**

```ts
type TraverseUp = {
    /** The parent element that was traversed. */
    element: HTMLElement;
    /** The URL of the target. */
    resource: string;
}
```

## `can-evaluate::script`

Event is emitted **when** the `connector` is ready to evaluate
scripts.

```ts
type CanEvaluateScript = {
    /** The URL of the target. */
    resource: string;
}
```

<!-- Link labels: -->

[nodeName docs]: https://developer.mozilla.org/en-US/docs/Web/API/Node/nodeName
[parsers]: https://webhint.io/docs/user-guide/concepts/parsers/
