# Create Server (`@hint/utils-create-server`)

Create a server to run tests

## Installation

To install the package, you need to run:

```bash
npm install @hint/utils-create-server
```

## Architecture

The test web server is `spawn`ed in a new thread. There reasons for this are:

* Better isolation
* Improve the debugging experience

With the current architecture knowing what is actually returned by the
server is easier because a web browser can be used while debugging the
code. Before if the code hit a breakpoint the webserver would be blocked
as well and nothing will be returned.

There main 2 pieces are:

* `index.ts`: This is what modules consume. It is in charge of `spawn`ing
  the server process and handle the communication with it. All methods are
  `async` to achive this.
* `server.ts`: The real web server. It uses `express` and listens to the
  messages sent by `index.ts`.

The communication between both is done via IPC. Each message sent by
`index.ts` needs a response to confirm the action has been completed, i.e.
if it sends a `start` message it should receive a `start` message as well.

The following is an example of messages used:

```json
{
    "webhint": {
        "type": "start"
    }
}
```

Please note that all messages are "scoped" to `webhint` to avoid collision
with other possible messages.

IPC serializes the messages to `JSON`. Unfortunatelly it does not accept
[`replacer`][replacer]/[`reviver`][reviver] functions. The server
configuration accepts `Buffer`s so in order to send the right data we need
to manually (de)serialize the messages in both ends.

<!-- Link labels -->

[replacer]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify#The_replacer_parameter
[reviver]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/parse#Using_the_reviver_parameter
