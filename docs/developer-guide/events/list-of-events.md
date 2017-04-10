# List of events emitted by a collector

`collector`s communicate via events. The following is a list of all the events
commont to all `collector`s, with their signature and the `interface` they implement.

## `targetfetch::start`

* **When?** When the `collector` is about to start the request to fetch the `target`.
* **Format**
```typescript
export interface IFetchStartEvent {
    /** The url to download */
    resource: string;
}
```
* **Remarks:** The event is the same for [`fetch::start`](#fetch::start)

## `targetfetch::end`

* **When?** When the `collector` has finished downloading the `html` of the `target`.
* **Format**
```typescript
export interface IFetchEndEvent {
    /** The element that initiated the request. */
    element: IAsyncHTMLElement;
    /** The url of the target. */
    resource: string;
    /** The request made to fetch the target. */
    request: IRequest;
    /** The response sent while fetching the target. */
    response: IResponse;
}
```
* **Remarks:** The event is the same for [`fetch::end`](#fetch::end). In this case `element` will be null.

## `targetfetch::error`

* **When?** When the `collector` has found a problem downloading the `html` of the `target`.
* **Format**
```typescript
export interface IFetchErrorEvent {
    /** The url of the target. */
    resource: string;
    /** The element that initiated the request. */
    element: IAsyncHTMLElement;
    /** The error found. */
    error: any;
}
```
* **Remarks:** The event is the same for [`fetch::error`](#fetch::error). In this case `element` will be null.

## `fetch::start`
* **When?** When the `collector` is about to start the request to fetch the `target`.
* **Format**
```typescript
export interface IFetchStartEvent {
    /** The url to download */
    resource: string;
}
```
* **Remarks:** The event is the same for [`targetfetch::start`](#targetfetch::start).

## `fetch::end`

* **When?** When the `collector` has finished downloading the content of a `resource` (`js`, `css`, `image`, etc.).
* **Format**
```typescript
export interface IFetchEndEvent {
    /** The element that initiated the request. */
    element: IAsyncHTMLElement;
    /** The url of the target */
    resource: string;
    /** The request made to fetch the target. */
    request: IRequest;
    /** The response sent while fetching the target. */
    response: IResponse;
}
```
* **Remarks:** The event is the same for [`targetfetch::end`](#targetfetch::end).

## `fetch::error`

* **When?** When the `collector` has found a problem downloading the content of a `resource`.
* **Format**
```typescript
export interface IFetchErrorEvent {
    /** The url of the target. */
    resource: string;
    /** The element that initiated the request. */
    element: IAsyncHTMLElement;
    /** The error found. */
    error: any;
}
```
* **Remarks:** The event is the same for [`targetfetch::error`](#targetfetch::error).

## `traverse::start`

* **When?** When the `collector` is going to start traversing the DOM.
* **Format**
```typescript
export interface ITraverseStartEvent {
    /** The url of the target. */
    resource: string;
}
```

## `traverse::end`

* **When?** When the `collector` has finished traversing the DOM entirely.
* **Format**
```typescript
export interface ITraverseEndEvent {
    /** The url of the target. */
    resource: string;
}
```

## `traverse::down`

* **When?** When the `collector` is traversing and starts visiting the children
of a node.
* **Format**
```typescript
export interface ITraverseDownEvent {
    /** The url of the target. */
    resource: string;
}
```

## `traverse::up`

* **When?** When the `collector` has finsihed visting the children of a node and goes to the next one.

* **Format**
```typescript
export interface ITraverseUpEvent {
    /** The url of the target. */
    resource: string;
}
```

## `element::typeofelement`

* **When?** When the `collector` visits an element in the DOM when traversing it. `XXXX` is the `nodeType` lower cased.

* **Format**
```typescript
export interface IElementFoundEvent {
    /** The uri of the resource firing this event. */
    resource: string;
    /** The visited element. */
    element: IAsyncHTMLElement;
}
```
