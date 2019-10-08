# Contributing to the webhint browser extension

## Build and Test

### Build after initial checkout

From the root of the repo run the following:

```bash
yarn
yarn build
cd packages/extension-browser
```

### Rebuild after changes

To rebuild just the browser extension you can

```bash
yarn build
```

from `/packages/extension-browser`.

### Test development build

To locally test your changes you will have to sideload the extension.
The generated files are under `"dist/bundle/"`.

* [Chrome sideload extension][chrome sideload].
* [Firefox temporary add-on installation][ff addon].

### Release builds

Running the release build command will generate zip files
for both Chromium-based browsers and Firefox, found under
`dist/chromium/` and `dist/firefox/` respectively.

```bash
yarn build-release-packages
```

These are the packages that will be published to the stores. To test them
you can sideload them using the same method as described earlier.

### Exploring the used dependencies

To know what dependencies are being bundled in the extension you can run
the following from `/packages/extension-browser`:

```bash
yarn webpack-stats
```

This will generate a (big) `stats.json` file.

Go to [webpack visualizer][] or a similar tool and drop that file there to
explore all the dependencies in the package.

## High-level architecture

The browser extension includes components which collaborate across
different extension contexts in order to instantiate and analyze a
site. These are:

1. Devtools page `"src/devtools/devtools.(html|ts)"`
   * Creates the devtools panel

2. Devtools panel `"src/devtools/panel.(html|tsx)"`, `"src/devtools/utils/"`,
   and "`src/devtools/views/`"
   * Shows UI to the user and responds to user input
   * Sends messages to the background script to start/stop scans
   * Forwards network requests to the background script during a scan
   * Displays results received from the background script

3. Background script `"src/background-script.ts"`
   * Listens for messages from the devtools panel to start/stop scans
   * Injects the content script into a target page during a scan
   * Forwards network requests from the devtools panel to the content script
   * Forwards results from the content script to the devtools panel

4. Content script `"src/content-script/(webhint.ts|connector.ts|formatter.ts)"`
   * Listens for configuration and network requests from background script
   * Contains a bundled version of `hint` and related dependencies
   * Forwards network requests to bundled version of `hint`
   * Custom `connector` generates `element::*` events from the mirror DOM
   * Custom `formatter` forwards results to the background script

## Devtools panel details

The UI layer of the devtools panel is organized into components using
[React Hooks](https://reactjs.org/docs/hooks-intro.html). Each component's
styles are isolated using
[CSS Modules](https://github.com/css-modules/css-modules).

### Switching design systems

A build-time design system can be specified using `build --env.design=fluent`
or `build --env.design=photon` (default is `fluent`). Predefined designed
systems are also already associated with release builds (`fluent` for Chromium
and `photon` for Firefox).

At runtime the current design system can be switched by pressing `CTRL+ALT+D`.

### Handling design systems

The extension supports multiple design systems, currently Fluent and Photon,
with a light and dark theme for each. Each component can optionally have a
design-specific stylesheet if needed.

```tsx
import * as fluent from './component.fluent.css';
import * as photon from './component.photon.css';

const Component = () => {
    const styles = useCurrentDesignStyles({ fluent, photon });

    return <div className={styles.root} />
}
```

However most differences between designs are defined in the top-level `App`
component using CSS variables. If all you need to customize is a color,
you should edit or add a CSS variable here and consume it in the unified
stylesheet for your component.

```css
/* app.fluent.css */
.root {
    --my-color: #00d;
}
```

```css
/* app.photon.css */
.root {
    --my-color: #00c;
}
```

```css
/* component.css */
.root {
    color: var(--my-color);
}
```

```tsx
/* component.tsx */
import * as styles from './component.css';

const Component = () => {
    return <div className={styles.root} />
}
```

Note that `.root` here has different, scoped meanings in each stylesheet
due to the use of CSS Modules. Each one refers to the root of the component
the stylesheet is associated with and will be transformed based on the filename
of the stylesheet by the build process. The above example might look something
like the following at runtime:

```css
.app-fluent_root_xT34s {
    --my-color: #00d;
}

.app-photon_root_zSn4c {
    --my-color: #00c;
}

.component_root_ck9Ns {
    color: var(--my-color);
}
```

```html
<div class="app-fluent_root_xT34s">
    <div class="component_root_ck9Ns"></div>
</div>
```

### Handling dark theme

Since dark theme typically only results in color changes, it is handled
almost entirely in the stylesheet for the root `App` component. However
a custom React Hook `useCurrentTheme` is available that can be accessed
from any component to determine the current theme if needed. In most
cases you'd customize colors like this:

```css
/* app.fluent.css */
.root[data-theme='dark'] {
    --my-color: #004;
}
```

```css
/* app.photon.css */
.root[data-theme='dark'] {
    --my-color: #003;
}
```

### Adding a new design system

Declaring a new design system starts by adding a new entry to the
`DesignSystem` `enum` in `"src/devtools/utils/themes.ts"`. Afterward you must
add a stylesheet for that design system to every component which declares
multiple designs before the build will pass. Each of those stylesheets must
also declare the same classes present in the other design systems for a given
component.

```ts
enum DesignSystems {
    fluent = 'fluent',
    photon = 'photon'
}
```

## Content script details

The content script controls which part of webhint are included as part of the
browser extension. It also controls plumbing data from the browser such as
network requests, DOM details, and results from evaluating script, back into
the bundled `hint` instance.

### Adding a new hint

Just add the appropriate `@hint/hint-*` package as a `devDependency` in
`package.json`. The build script `"scripts/import-hints.js"` will take care of
the rest:

```json
  "devDependencies": {
    "@hint/hint-new": "^1.0.0"
  }
```

### Adding a new parser

Add the appropriate `@hint/parser-*` package as a `devDependency` in
`package.json` and edit `"content-script/webhint.ts"` to both import the
parser and include it in the `Configuration` and `HintResources` further
down the file:

```ts
import NewParser from '@hint/parser-new';
...
    const config: Configuration = {
        ...
        parsers: [..., 'new']
    };
...
    const resources: HintResources = {
        ...
        parsers: [
            ...
            NewParser as any
        ]
    };
```

<!-- Link labels -->

[ff addon]: https://extensionworkshop.com/documentation/develop/temporary-installation-in-firefox/
[chrome sideload]: https://developer.chrome.com/extensions/getstarted#manifest
[webpack visualizer]: https://chrisbateman.github.io/webpack-visualizer/
