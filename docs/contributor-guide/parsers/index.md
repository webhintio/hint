# How to develop a parser

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

        this.sonarwhal.on('fetch::end', this.onFetchEnd);
    }

    public async onFetchEnd(data: IFetchEnd) {
        // Your magic to detect if the parser understands the content here
        // You probably want to check the contentType first
        // and maybe leter use a schema if a configuration file or something else

        // If there's something to share, do it via an event
        await this.sonarwhal.emitAsync('customparser::custom', data);
    }
}
```

The way `parser`s receive and share information is via events. To access
a resource the parser needs to subscribe in the `constructor` to one of
the `*fetch::end` events, most likely the `fetch::end`. Because that
event is emitted for all downloaded resources, you need to check first
if you can understand it. A good approach would be:

1. check first the `mediaType` of the response (`fetchEndEvent.response.mediaType`)
2. use a schema to validate if `json`, `xml` or something similar
3. parse it somehow (E.g.: for `javascript` using something like `ESTree`
   to validate)

Once you have analyzed the resource, the way to share information is via
events (custom or not):

```ts
await this.sonarwhal.emitAsync('customparser::custom', data);
```

Just make sure to document which ones you are sending so `rule`s can use
them and know what to expect.

You can always check the code of any of the official `parser`s for
more complex scenarios.
