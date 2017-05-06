# Accessibility assesment with aXe

aXe is the Accessibility Engine for automated testing of HTML-based user
interfaces. This rules performs the default accessibility tests (WCAG 2.0
Level A and Level AA rules) and alerts if something fails.

## Why is this important?

> The Web is an increasingly important resource in many aspects of life: education,
employment, government, commerce, health care, recreation, and more. It is
essential that the Web be accessible in order to provide **equal access** and **equal
opportunity** to people with disabilities. An accessible Web can also help people
with disabilities more actively participate in society.
>
> The Web offers the possibility of **unprecedented access to information and
interaction** for many people with disabilities. That is, the accessibility barriers
to print, audio, and visual media can be much more easily overcome through Web
technologies.
>
> The document ["Social Factors in Developing a Web Accessibility Business Case for
Your Organization"](https://www.w3.org/WAI/bcase/soc) discusses how the Web
impacts the lives of people with disabilities, the overlap with digital divide
issues, and Web accessibility as an aspect of corporate social responsibility.
>
> Another important consideration for organizations is that Web accessibility is
required by laws and policies in some cases.

***From [WAI's Introduction to Web Accessibility](https://www.w3.org/WAI/intro/accessibility.php).***

## What does the rule check?

By default this rule runs all the [WCAG 2.0](https://www.w3.org/TR/WCAG20/)
Level A and Level AA rules included in [axe-core](https://github.com/dequelabs/axe-core/)
with `document` as the target. Visit the
[full list of default enabled rules](https://github.com/dequelabs/axe-core/blob/develop/doc/rule-descriptions.md)
for more information of what they do.

## Can the rule be configured?

This rule uses
[`axe.run`](https://github.com/dequelabs/axe-core/blob/develop/doc/API.md#api-name-axerun)
and the default values ([WCAG 2.0](https://www.w3.org/TR/WCAG20/) Level A and
Level AA rules) over the `document`.
You can modify what rules or categories are executed via an `options` object
that follows
[aXe's documentation](https://github.com/dequelabs/axe-core/blob/develop/doc/API.md#options-parameter).

Some examples of configurations:

* Run only WCAG 2.0 Level A rules:

  ```json
  {
    "axe": ["error", {
        "runOnly": {
        "type": "tag",
          "values": ["wcag2a"]
        }
    }]
  }
  ```

* Run only a specified set of rules:

  ```json
  {
      "axe": ["error", {
          "runOnly": {
              "type": "rule",
              "values": ["ruleId1", "ruleId2", "ruleId3" ]
          }
      }]
  }
  ```

* Run all enabled rules except for a list of rules:

  ```json
  {
      "axe": ["error",{
          "rules": {
              "color-contrast": { "enabled": false },
              "valid-lang": { "enabled": false }
          }
      }]
  }
  ```

## Further Reading

* [Deque Univeristy](https://dequeuniversity.com/)
* [aXe core GitHub page](https://github.com/dequelabs/axe-core)
* [Web Accessibility Initiative (WAI)](https://www.w3.org/WAI/)
