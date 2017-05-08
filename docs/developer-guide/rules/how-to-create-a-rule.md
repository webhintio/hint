# How to create a rule

To create a new rule you just need to:

* Create a `new-rule.ts` file in a folder with the same name of the rule
  file (e.g.: `src/rules/new-rule/new-rule.ts`)

* Have the following template:

  ```ts
  import * from '../../utils/rule-helpers';
  // The list of types depends on the [events](../events/list-of-events.md) you want to capture.
  import { IFetchEndEvent, IRule, IRuleBuilder } from '../../types'; // eslint-disable-line no-unused-vars
  import { RuleContext } from '../../rule-context'; // eslint-disable-line no-unused-vars

  const rule: IRuleBuilder = {
      create(context: RuleContext): IRule {
          // Your code here.

          const validateFetchEnd = (fetchEnd: IFetchEndEvent) => {
              // Code to validate the rule on the event fetch::end.
          }

          const validateTargetFetchEnd = (targetFetchEnd: IFetchEndEvent) => {
              // Code to validate the rule on the event targetfetch::end.
          }

          return {
            'fetch::end': validateFetchEnd,
            'targetfetch::end': validateTargetFetchEnd
            // As many events as you need, you can see the
            // list of events [here](../events/list-of-events.md).
        };
      },
      meta: {}
  }
  ```

## Target specific browsers

If your rule only applies to specific browsers you should use
`context.targetedBrowsers` and check if you need to get executed or not.

```ts
const validateFetchEnd = (fetchEnd: IFetchEndEvent) => {
    if(!context.targetedBrowsers.includes('Edge 14')) {
        return;
    }

    // Your validations
}
```

## Ignore some urls

If your rule doesn't apply to specific urls you use the property `ignoredUrls` in your configuration file

```json
"ignoredUrls": {
    ".*\\.domain1\\.com/.*": ["*"], //Apply to all the rules, events won't be emitted for that urls
    ".*\\.domain2\\.net/.*": ["disallowed-headers"] //Just apply to the rule disallowed-headers
}
```
