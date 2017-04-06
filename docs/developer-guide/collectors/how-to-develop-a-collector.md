# How to develop a collector

You need to create a new test file (`name-of-your-collector.ts`) that
will at least use `tests/lib/collectors/_common.ts`.

A minimum test for your collector will look as follows:

```typescript
import builder from 'path/to/your/collector';
import { testCollector } from './_common';

// First test that it passes the standard tests for all collectors
testCollector(builder);

// Specific tests now
// You might want to `import ava` if you decide to do so
```

The list of events that they need to implement is:

* `targetfetch::start`
* `targetfetch::end`
* `targetfetch::error`
* `fetch::start`
* `fetch::end`
* `fetch::error`
* `traverse::start`
* `traverse::end`
* `traversing::up`
* `traversing::down`
* `element::XXXX` where `XXXX` is the `nodeName` in lower case.
Sent during the DOM traversing phase.
