# How to develop a collector

A collector is the way sonar gets information and exposes it to the rules.
Collectors are usually built on top of browsers but that isn't a strong
requirement. For example, one of the official collectors uses [jsdom](https://github.com/tmpvar/jsdom).

A collector exposes the information via events, so as long as they are
correct, the underlying technology doesn't matter. Also, you could have
more "specialized" collectors that do not implement the full set of events.
For example, if you have a collector that only takes into account HTML files
from the file system, it could decide not to implement events such as
`fetch::end`.

This is the [list of events supported by sonar](./events.md). For a collector
to be considered "full", it needs to send all these events. Additionally it
needs to pass all the [commont tests](#how-to-test-a-full-collector).

## Develop a "full" collector

A collector needs to implemnet the [`ICollector` interface](https://github.com/sonarwhal/sonar/blob/master/src/lib/types/collector.ts)

The entry point to scan a url is `collect`, that is an `async` method.
Once this method is invoked the following events should be fired in this order:

1. [`scan::start`](./events.md#scanstart)
1. [`targetfetch::start`](./events.md#targetfetchstart)
   * If there is an error, send [`targetfetch::error`](./events.md#targetfetcherror)
   follow by [`scan::end`](./events.md#targetfetchend).
1. [`targetfetch::end`](./events.md#targetfetchend)
1. Once the content is downloaded, network requests for different resources
   (CSS, JS, etc.) are performed. Depending on the collector, they will be
   downloaded at one moment or another (critical path, capable of parse HTML as
   a stream, etc.). The events for these resources are:
   * [`fetch::start`](./events.md#fetchstart)
   * [`fetch::end`](./events.md#fetchend)
   * [`fetch::error`](./events.md#fetcherror)
1. [`traverse::start`](./events.md#traversestart)
   Collectors should wait for the `onload` event and make sure that "everything
   is quiet": there aren't any pending network requests or if there are, the
   collector has waited a reasonable amount of time.
   The traversing of the DOM is [depth-first](https://en.wikipedia.org/wiki/Depth-first_search), sending:
   * [`element::<element-type>`](./events.md#elementelement-type) when visiting a node (see [IASyncHTML](#iasynchtml) for more information,
   * [`traverse::down`](./events.md#traversedown) when going deeper in the DOM,
   * [`traverse::up`](./events.md#traverse::up) when going up.
1. [`traverse::end`](./events.md#traverse::end)
1. Before sending the final event, the collector needs to try to download the web manifest:
   to download the manifest automatically and send the following events:
   * [`manifestfetch::end`](./events.md#manifestfetchend) with the content of
   the manifest,
   * [`manifestfetch::error`](./events.md#manifestfetchend) if there has been
   an error downloading the manifest,
   * [`manifestfetch::missing`](./events.md#manifestfetchend) if no manifest
   is specified.
1. The final event is [`scan::end`](./events.md#scanend).

For more details about how the events look like and the properties they should implement, visit the [events page](,/.events.md).

Also, collectors need to expose some methods:

```ts
export interface ICollector {
    /** The original DOM of the resource collected. */
    dom: object;
    /** The original HTML of the resource collected. */
    html: Promise<string>;
    /** The headers from the response if applicable. */
    headers: object;
    /** Collects all the information for the given target. */
    collect(target: url.Url): Promise<any>; // TODO: TS doesn't detect correctly `pify` promises
    /** Releases any used resource and/or browser. */
    close(): Promise<void>;
    /** Download an external resource using ` customHeaders` if needed. */
    fetchContent(target: URL | string, customHeaders?: object): Promise<INetworkData>;
    /** Evaluates the given JavaScript `code` asynchronously in the target. */
    evaluate(code: string): Promise<any>;
    /** Finds all the nodes that match the given query. */
    querySelectorAll(query: string): Promise<Array<IAsyncHTMLElement>>
}
```

### IASyncHTML

IAsyncHTML is an abstraction on top of the `collector`'s DOM. The reason
is that some `collector`s can access the DOM synchronously (like `jsdom`)
and some others don't (like those that rely on a debugging protocol). We
decided to create an asynchronous abstraction so the different parts that
might need access to the DOM know how to use. `IAsyncHTML` is composed two
interfaces:
`IAsyncHTMLElement` and `IAsyncHTMLDocument`. Not all the `HTMLElement` or
`HTMLDocument` properties are implemented:

```ts
/** A wrapper of an HTMLElement that gives access to the required resources
  * asynchronously to be compatible with all collectors */
export interface IAsyncHTMLElement {
    /** The attributes of the element */
    readonly attributes: Array<{ name: string, value: string }> | NamedNodeMap;
    /** Returns the value for a given attribute */
    getAttribute(attribute: string): string;
    /** Checks if two AsyncHTMLElements are the same */
    isSame(element: IAsyncHTMLElement): boolean;
    /** Returns the outerHTML of the element */
    outerHTML(): Promise<string>;
    /** Returns the document where the element lives */
    readonly ownerDocument: IAsyncHTMLDocument;
    /** The nodeName of the element */
    readonly nodeName: string
}

export interface IAsyncHTMLDocument {
    /** A wrapper around querySelectorAll that returns an Array of AsyncHTMLElements instead of a NodeList */
    querySelectorAll(selector: string): Promise<Array<IAsyncHTMLElement>>
    /** The HTML of the page as returned by document.children[0].outerHTML or similar */
    pageHTML(): Promise<string>;
}
```

When traversing the DOM, the `element` in the `event` needs to be an
`IAsyncHTMLElement`.

## How to test a "full" collector

To make sure your collector is a "full" collector, it has to pass the
following tests:

1. `/tests/lib/collectors/events.ts` verifies the basic event interaction,
   redirects, right results, etc.
1. `/tests/lib/collectors/evaluate.ts` makes sure the collector can execute
   external JavaScript.
1. `/tests/lib/rules/**/*` all rules tests should pass.
