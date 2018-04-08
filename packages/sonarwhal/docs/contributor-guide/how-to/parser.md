# Develop a parser

A `parser` understands more deeply a resource and exposes that
information to other parts of `sonarwhal`.

To create one, you will need to create a new `Class` that extends from
`Parser`.

```ts
import { Parser, IFetchEnd } from '../../types';
import { Sonarwhal } from '../../sonarwhal';

export default class CustomParser extends Parser {

    public constructor(sonarwhal: Sonarwhal) {
        super(sonarwhal);

        // Replace 'resource' with the tipe you need (html, script,
        // css, image, etc.)
        this.sonarwhal.on('fetch::end::resource', this.onFetchEnd);
    }

    public async onFetchEnd(data: FetchEnd) {
        // Your magic to detect if the parser understands the content here
        // You probably want to check the contentType first
        // and maybe leter use a schema if a configuration file or something else

        // If there's something to share, do it via an event
        await this.sonarwhal.emitAsync('customparser::custom', data);
    }
}
```

The way `parser`s receive and share information is via events. To access
a resource the parser needs to subscribe in the `constructor` to one or
more events. In most cases you will subscribe to one of the `fetch::end::<resource-type>`
events, like `fetch::end::script`.

Once you have analyzed the resource, the way to share information is via
events (custom or not):

```ts
await this.sonarwhal.emitAsync('customparser::custom', data);
```

Make sure to document which ones you are sending so `rule`s can use
them and know what to expect.

You can always check the code of any of the official `parser`s for
more complex scenarios.
