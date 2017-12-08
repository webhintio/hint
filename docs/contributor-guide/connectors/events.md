# Events

`connector`s communicate via events. The following is a list of all
the events common to all `connector`s, with their signature, and the
`interface` they implement.

* [`element::<element-type>`](#elementelement-type)
* [`fetch::end`](#fetchend)
* [`fetch::error`](#fetcherror)
* [`fetch::start`](#fetchstart)
* [`manifestfetch::end`](#manifestfetchend)
* [`manifestfetch::error`](#manifestfetcherror)
* [`manifestfetch::start`](#manifestfetchstart)
* [`manifestfetch::missing`](#manifestfetchmissing)
* [`scan::end`](#scanend)
* [`scan::start`](#scanstart)
* [`targetfetch::end`](#targetfetchend)
* [`targetfetch::error`](#targetfetcherror)
* [`targetfetch::start`](#targetfetchstart)
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
export interface IElementFound {
    /** The URI of the resource firing this event. */
    resource: string;
    /** The visited element. */
    element: IAsyncHTMLElement;
}
```

## `fetch::end`

Event is emitted **when** the `connector` has finished downloading
the content of a `resource` (`js`, `css`, `image`, etc.).

**Format:**

```ts
export interface IFetchEnd {
    /** The element that initiated the request. */
    element: IAsyncHTMLElement;
    /** The URL of the target */
    resource: string;
    /** The request made to fetch the target. */
    request: IRequest;
    /** The response sent while fetching the target. */
    response: IResponse;
}
```

**Note:** This is a basic event interface that
[`targetfetch::end`](#targetfetchend) and
[`manifestfetch::end`](#manifestfetchend) extend from.

## `fetch::error`

Event is emitted **when** the `connector` has encountered a problem
downloading the content of a `resource`.

**Format:**

```ts
export interface IFetchError {
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

**Note:** This event has the same interface as
[`targetfetch::error`](#targetfetcherror).

## `fetch::start`

Event is emitted **when** the `connector` is about to start the request
to fetch the `target`.

**Format:**

```ts
export interface IFetchStart {
    /** The URL to download */
    resource: string;
}
```

**Note:** This is a basic event interface that
[`targetfetch::start`](#targetfetchstart) extends from.

## `manifestfetch::end`

Event is emitted **when** the `connector` has finished downloading
the web manifest of a page.

**Format:**

```ts
export interface IManifestFetchEnd {
    /** The element that initiated the request. */
    element: IAsyncHTMLElement;
    /** The URL of the target */
    resource: string;
    /** The request made to fetch the target. */
    request: IRequest;
    /** The response sent while fetching the target. */
    response: IResponse;
}
```

**Note:** This event interface extends from [`fetch::end`](#fetchend).

## `manifestfetch::start`

Event is emitted **when** the `connector` is about to start downloading
the web manifest.

**Format:**

```ts
export interface IFetchStart {
    /** The URL to download */
    resource: string;
}
```

**Note::** This event has the same interface as
[`fetch::start`](#fetchstart).

## `manifestfetch::error`

Event is emitted **when** the `connector` has encountered a problem
downloading the web manifest.

**Format:**

```ts
export interface IManifestFetchError {
    /** The URL of the target. */
    resource: string;
    /** The error found. */
    error: any;
}
```

## `manifestfetch::missing`

Event is emitted **when** the `connector` hasn’t found any manifest to
download.

**Format:**

```ts
export interface IManifestFetchMissing {
    /** The URL to download */
    resource: string;
}
```

## `scan::end`

Event is emitted **when** the `connector` has finished sending all
events and its about to return. This is the last event to be emitted.

**Format:**

```ts
export interface IScanEnd {
     /** The final URL analyzed. */
    resource: string;
}
```

## `scan::start`

Event is emitted **when** the `connector` is about to start the
analysis. This is the first event to be emitted.

**Format:**

```ts
export interface IScanStart {
    /** The URL to analyze. */
    resource: string;
}
```

**Note:** This event is fired synchronously. You should not return
a `Promise` because it will not wait for it to be resolved. If you
need to perform an `async` operation you should combine it with
`scan::end`. You can find more information in [how to interact with
other services](../rules/index.md#interact-with-other-services).

## `targetfetch::end`

Event is emitted **when** the `connector` has finished downloading
the `target`.

**Format:**

```ts
export interface ITargetFetchEnd {
    /** The element that initiated the request. */
    element: IAsyncHTMLElement;
    /** The URL of the target. */
    resource: string;
    /** The request made to fetch the target. */
    request: IRequest;
    /** The response sent while fetching the target. */
    response: IResponse;
}
```

**Note:** This event interface extends from [`fetch::end`](#fetchend).
In this case `element` will be `null`.

## `targetfetch::error`

Event is emitted **when** the `connector` has encountered a problem
downloading the `target`.

**Format:**

```ts
export interface IFetchError {
    /** The URL of the target. */
    resource: string;
    /** The element that initiated the request. */
    element: IAsyncHTMLElement;
    /** The error found. */
    error: any;
}
```

**Note::** This event has the same interface as [`fetch::error`](#fetcherror).
In this case `element` will be `null`.

## `targetfetch::start`

Event is emitted **when** the `connector` is about to start the
request to fetch the `target`. Redirects are followed if needed.

**Format:**

```typescript
export interface ITargetFetchStart {
    /** The URL to download */
    resource: string;
}
```

**Note::** This event interface extends from [`fetch::start`](#fetchstart).

## `traverse::down`

Event is emitted **when** the `connector` is traversing and starts
visiting the children of a node.

**Format:**

```ts
export interface ITraverseDown {
    /** The URL of the target. */
    resource: string;
}
```

## `traverse::end`

Event is emitted **when** the `connector` has finished traversing
the DOM entirely.

**Format:**

```ts
export interface ITraverseEnd {
    /** The URL of the target. */
    resource: string;
}
```

## `traverse::start`

Event is emitted **when** the `connector` is going to start traversing
the DOM.

**Format:**

```ts
export interface ITraverseStart {
    /** The URL of the target. */
    resource: string;
}
```

## `traverse::up`

Event is emitted **when** the `connector` has finsihed visting the
children of a node and goes to the next one.

**Format:**

```ts
export interface ITraverseUp {
    /** The URL of the target. */
    resource: string;
}
```

<!-- Link labels: -->

[nodeName docs]: https://developer.mozilla.org/en-US/docs/Web/API/Node/nodeName
