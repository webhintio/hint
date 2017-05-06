# How to develop a collector

You need to create a new test file (`name-of-your-collector.ts`) that
will at least use `tests/lib/collectors/_common.ts`.

A minimum test for your collector will look as follows:

```ts
import builder from 'path/to/your/collector';
import { testCollector } from './_common';

// First test that it passes the standard tests for all collectors
testCollector(builder);

// Specific tests now
// You might want to `import ava` if you decide to do so
```

A collector needs to implement [this list of events](../events/list-of-events.md).
