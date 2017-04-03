Collectors are expected to implement at least some basic functionality
(see [how to develop a collector](../developer-guide/collectors/how-to-develop-a-collector.md))
but expose more events of have some extra functionality. The following
document details the known differences among the official collectors

## JSDOM

* It will not send the events for:

  * `element::#document`
  * `element::#comment`
