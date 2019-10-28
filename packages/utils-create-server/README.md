# Create Server (`@hint/utils-create-server`)

Create a server to run tests

## Installation

This package is installed automatically when using `npm create hint`,
no need to do anything from your side.

## Architecture

The test web server can run in a different thread (default) or the same one
(when in CI or if indicated by the user ) as the tests.
The following is a summary on the benefits of each one:

* Independent:
  * Better isolation
  * Improve the debugging experience (website can load even if the execution
    is stopped in a breakpoint)
* Same thread:
  * Less resources needed
  * Faster execution

There main pieces are:

* `index.ts`: This is what modules consume. Depending on the configuration
  or the environment it will use one type of server or another.
* `same-thread-server.ts`: The real web server. It uses `express` and listens
  to the messages sent by `index.ts`. This will also be the class used when
  running in CI. If `spawn`ed then it will listen for IPC messages for the
  configuration.
* `independent-thread-server.ts`: It is a "wrapper" on top of
  `same-thread-server.ts`. It `spawn`s that process and handles the
  communication with it asynchronously.

When using a different process, each message sent needs a response to confirm
the action has been completed, i.e. if it sends a `start` message it should
receive a `start` message as well.
In the case of same thread all the methods are `async` as well so both servers
implement the same interface and the code does not need to special handle one
or the other.

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
