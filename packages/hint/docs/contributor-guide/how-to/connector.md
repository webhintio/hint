# Develop a connector

A connector is the way `webhint` gets information and exposes it to the
hints. Connectors are usually built on top of browsers but that isn’t
a strong requirement. For example, one of the official connectors uses
[`jsdom`][jsdom].

A connector exposes the information via events, so as long as they
are correct, the underlying technology doesn’t matter. Also, you could
have more "specialized" connectors that do not implement the full set
of events. For example, if you have a connector that only takes into
account HTML files from the file system, it could decide not to
implement events such as `fetch::end::<resource-type>`.

For a connector to be considered "full", it needs to send at least
[the events listed here][events]. Additionally it needs to pass all
the [common tests](#how-to-test-a-full-connector).

## Develop a "full" connector

A connector needs to implement the [`IConnector` interface][iconnector interface].

The entry point to scan a url is `collect`, that is an `async` method.
Once this method is invoked the following events should be fired in
this order:

1. [`scan::start`][events scanstart]
1. [`fetch::start`][events fetchstart]
   * If there is an error, send [`fetch::error`][events fetcherror]
     follow by [`scan::end`][events scanend].
1. [`fetch::end::html`][events fetchend]
1. Once the content is downloaded, network requests for different
   resources (CSS, JS, etc.) are performed. Depending on the connector,
   they will be downloaded at one moment or another (critical path,
   capable of parse HTML as a stream, etc.). The events for these
   resources are:
   * [`fetch::start`][events fetchstart]
   * [`fetch::end::<resource-type>`][events fetchend]
   * [`fetch::error`][events fetcherror]
1. [`traverse::start`][events traversestart]
   Connectors should wait for the `onload` event and make sure that
   "everything is quiet": there aren’t any pending network requests
   or if there are, the connector has waited a reasonable amount of
   time. The traversing of the DOM is [depth-first][depth-first search],
   sending:
   * [`element::<element-type>`][events element] when visiting a node,
   * [`traverse::down`][events traversedown] when going deeper in the DOM,
   * [`traverse::up`][events traverseup] when going up.
1. [`traverse::end`][events traverseend]
1. The final event is [`scan::end`][events scanend].

For more details about how the events look like and the properties they
should implement, see the [events page][events].

Also, connectors need to expose some methods:

```ts
export interface IConnector {
    /** The original DOM of the resource collected. */
    dom: object;
    /** The original HTML of the resource collected. */
    html: Promise<string>;
    /** The headers from the response if applicable. */
    headers: object;
    /** Collects all the information for the given target. */
    collect(target: url.Url): Promise<any>; // TODO: TS doesn’t detect correctly `pify` promises
    /** Releases any used resource and/or browser. */
    close(): Promise<void>;
    /** Download an external resource using ` customHeaders` if needed. */
    fetchContent(target: URL | string, customHeaders?: object): Promise<NetworkData>;
    /** Evaluates the given JavaScript `code` asynchronously in the target. */
    evaluate(code: string): Promise<any>;
    /** Finds all the nodes that match the given query. */
    querySelectorAll(query: string): HTMLElement[];
}
```

## How to test a "full" connector

To make sure your connector is a "full" connector, it has to pass the
following tests:

1. `/tests/lib/connectors/events.ts` verifies the basic event interaction,
   redirects, right results, etc.
1. `/tests/lib/connectors/evaluate.ts` makes sure the connector can execute
   external JavaScript.
1. `/tests/lib/hints/**/*` all hints tests should pass.

<!-- Link labels: -->

[depth-first search]: https://en.wikipedia.org/wiki/Depth-first_search
[iconnector interface]: https://github.com/webhintio/hint/blob/main/packages/hint/src/lib/types/connector.ts
[jsdom]: https://github.com/jsdom/jsdom
[events]: ../getting-started/events.md
[events scanstart]: ../getting-started/events.md#scanstart
[events fetchstart]: ../getting-started/events.md#fetchstartresource-type
[events fetcherror]: ../getting-started/events.md#fetcherrorresource-type
[events fetchend]: ../getting-started/events.md#fetchendresource-type
[events traversestart]: ../getting-started/events.md#traversestart
[events element]: ../getting-started/events.md#elementelement-type
[events traversedown]: ../getting-started/events.md#traversedown
[events traverseup]: ../getting-started/events.md#traverseup
[events traverseend]: ../getting-started/events.md#traverseend
[events scanend]: ../getting-started/events.md#scanend
