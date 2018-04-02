# Events

Information is shared internally via `event`s. `connector`s and `parser`s can
create them, while `parser`s and `rule`s consume them.
The following is a list of all the events common to all `connector`s, with
their signature, and the `interface` they implement.

* [`element::<element-type>`](#elementelement-type)
* [`fetch::end::<resource-type>`](#fetchendresource-type)
* [`fetch::error`](#fetcherrorresource-type)
* [`fetch::start`](#fetchstartresource-type)
* [`fetch::end::manifest`](#fetchendmanifest)
* [`fetch::error::manifest`](#fetcherrormanifest)
* [`fetch::start::manifest`](#fetchstartmanifest)
* [`fetch::missing::manifest`](#fetchmissingmanifest)
* [`scan::end`](#scanend)
* [`scan::start`](#scanstart)
* [`traverse::down`](#traversedown)
* [`traverse::end`](#traverseend)
* [`traverse::start`](#traversestart)
* [`traverse::up`](#traverseup)

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
    element: IAsyncHTMLElement;
}
```

## `fetch::end::<resource-type>`

Event is emitted **when** the content of a `resource` (`js`, `css`,
`image`, etc.) has finished downloading.

**Format:**

```ts
type FetchEnd {
    /** The element that initiated the request. */
    element: IAsyncHTMLElement;
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
type FetchError {
    /** The URL of the target. */
    resource: string;
    /** The element that initiated the request. */
    element: IAsyncHTMLElement;
    /** The error found. */
    error: any;
    /** The redirects performed for the url. */
    hops: Array<string>
}
```

## `fetch::start::<resource-type>`

Event is emitted **when** the request to fetch the `target` is about
to start

**Format:**

```ts
type FetchStart {
    /** The URL to download */
    resource: string;
}
```

## `fetch::end::manifest`

Event is emitted **when** the `connector` has finished downloading
the web manifest of a page.

**Format:**

```ts
type ManifestFetchEnd {
    /** The element that initiated the request. */
    element: IAsyncHTMLElement;
    /** The URL of the target */
    resource: string;
    /** The request made to fetch the target. */
    request: Request;
    /** The response sent while fetching the target. */
    response: Response;
}
```

**Note:** This event interface extends from [`fetch::end::<resource-type>`](#fetchendresource-type).

## `fetch::start::manifest`

Event is emitted **when** the `connector` is about to start downloading
the web manifest.

**Format:**

```ts
type FetchStart {
    /** The URL to download */
    resource: string;
}
```

**Note::** This event has the same interface as
[`fetch::start`](#fetchstart).

## `fetch::error::manifest`

Event is emitted **when** the `connector` has encountered a problem
downloading the web manifest.

**Format:**

```ts
type ManifestFetchError {
    /** The URL of the target. */
    resource: string;
    /** The error found. */
    error: any;
}
```

## `fetch::missing::manifest`

Event is emitted **when** the `connector` hasn’t found any manifest to
download.

**Format:**

```ts
type ManifestFetchMissing {
    /** The URL to download */
    resource: string;
}
```

## `parse::javascript`

Event is emitted **when** the `JavaScript parser` has finished parsing a
JavaScript resource (a file or a `<script>` tag).

**Format:**

```ts
type ScriptParse {
    /** The URL of the resource. */
    resource: string;
    /** The source code parsed */
    sourceCode: any;
}
```

## `scan::end`

Event is emitted **when** the `connector` has finished sending all
events and its about to return. This is the last event to be emitted.

**Format:**

```ts
type ScanEnd {
     /** The final URL analyzed. */
    resource: string;
}
```

## `scan::start`

Event is emitted **when** the `connector` is about to start the
analysis. This is the first event to be emitted.

**Format:**

```ts
type ScanStart {
    /** The URL to analyze. */
    resource: string;
}
```

**Note:** This event is fired synchronously. You should not return
a `Promise` because it will not wait for it to be resolved. If you
need to perform an `async` operation you should combine it with
`scan::end`. You can find more information in [how to interact with
other services](../rules/index.md#interact-with-other-services).

## `traverse::down`

Event is emitted **when** the `connector` is traversing and starts
visiting the children of a node. `element` is the parent node that
is to be traversed.

**Format:**

```ts
type TraverseDown {
    /** The parent element to be traversed. */
    element: IAsyncHTMLElement;
    /** The URL of the target. */
    resource: string;
}
```

## `traverse::end`

Event is emitted **when** the `connector` has finished traversing
the DOM entirely.

**Format:**

```ts
type TraverseEnd {
    /** The URL of the target. */
    resource: string;
}
```

## `traverse::start`

Event is emitted **when** the `connector` is going to start traversing
the DOM.

**Format:**

```ts
type TraverseStart {
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
type TraverseUp {
    /** The parent element that was traversed. */
    element: IAsyncHTMLElement;
    /** The URL of the target. */
    resource: string;
}
```

<!-- Link labels: -->

[nodeName docs]: https://developer.mozilla.org/en-US/docs/Web/API/Node/nodeName
