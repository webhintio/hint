# DOM utils (`@hint/utils-dom`)

Set of helpers to process DOM.

## Installation

This package is installed automatically when adding webhint to your project
so running the following is enough:

```bash
npm install hint --save-dev
```

## Utils

* `createHelpers`: Inject and invoke within the context of a page to generate
  global `webhint` helpers for creating DOM snapshots and resolving unique
  IDs to `Node`s.
* `createHTMLDocument`: Create an HTMLDocument object from an string.
* `findOriginalElement`: Perform a best-effort search to find an element in
the provided document which is likely the original source for the provided
element. Used to resolve element locations to the original HTML when possible.
* `getElementByUrl`: Get an HTMLElement given a URL.
* `getHTMLCodeSnippet`: Generate a Snippet code for a HTMLElement.
* `traverse`: Traverse an HTMLDocument.
* `HTMLDocument`: Class representing a HTMLDocument.
* `HTMLElement`: Class representing a HTMLElement.
* `restoreReferences`: Rebuild parent and sibling references in a DOM snapshot.
