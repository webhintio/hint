---
date: 08/20/2020
---
# Contributor guide

To improve your experiences with `webhint`, leverage the following article.

## Getting started

The following topics provide the basics to start working with `webhint`.

| Topic | Details |
|:--- |:--- |
| [Architecture][GettingStartedArchitecture] | The internals of the project and how parts communicate with each other \(**SPOILER**:  Use `event`instances\). |
| [Development environment][GettingStartedDevelopmentEnvironment] | The initial settings for your machine to start writing code. |
| [Pull requests][GettingStartedPullRequests] | The instructions for contributing updates to the `webhint` documentation.  To contribute back to the project, review the [Pull requests][GettingStartedPullRequests] section. |
| [Events][GettingStartedEvents] | The list of events that are internally used. |

## How to

The following topics provide the nuances of the different parts that make `webhint`, as well as some common scenarios.

*   [Create a custom shareable configuration][HowToConfiguration]
*   [Develop a connector][HowToConnector]
*   [Develop a formatter][HowToFormatter]
*   [Develop a parser][HowToParser]
*   [Develop a hint][HowToHint]
*   [Implement common hint scenarios][HowToCommonHintScenarios]
<!-- TODO * [Build the docs locally]() -->

## Guides

*   [Create a custom hint step by step][GuidesCreateCustomHint]


<!-- links -->

[GettingStartedArchitecture]: ./getting-started/architecture.md "Architecture"
[GettingStartedDevelopmentEnvironment]: ./getting-started/development-environment.md "Development environment"
[GettingStartedPullRequests]: ./getting-started/pull-requests.md "Pull requests"
[GettingStartedEvents]: ./getting-started/events.md "Events"
[HowToConfiguration]: ./how-to/configuration.md "Create a custom shareable configuration"
[HowToConnector]: ./how-to/connector.md "Develop a connector"
[HowToFormatter]: ./how-to/formatter.md "Develop a formatter"
[HowToParser]: ./how-to/parser.md "Develop a parser"
[HowToHint]: ./how-to/hint.md "Develop a hint"
[HowToCommonHintScenarios]: ./how-to/common-hint-scenarios.md "Implement common hint scenarios"
[GuidesCreateCustomHint]: ./guides/create-custom-hint.md "Create a custom hint step-by-step"
