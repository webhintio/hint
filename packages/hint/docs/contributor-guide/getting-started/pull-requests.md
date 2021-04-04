# Pull requests

Contributing code to `webhint` is done using pull requests. This is
the fastest way for us to evaluate your code and to merge it into
the code base.

Please only use pull requests and don’t file issues with snippets
of code, as doing so means that we need to manually merge the changes
and update any appropriate documentation and tests. That decreases the
likelihood of your code getting included in a timely manner.

Also, before embarking on any significant pull request (e.g.
implementing features, refactoring code, porting to a different
language, etc.), make sure there is an issue that describes what
you intend to do, the issue has been accepted, and was not assigned
to anyone else.

If there is no such issue, create a new issue. If there is one that
is not assigned, leave a comment stating that you want to work on it,
and we will assign it to you.

For bug fixes, documentation changes, and other small changes, there is
no need to create an issue, and you can make the pull request.

## Getting started

If you’d like to work on a pull request, and you’ve never submitted
code before, follow these steps:

1. Sign our [Contributor License Agreement][cla].
2. Set up a [development environment](development-environment.md).

After that, you’re ready to start working on code.

## Working with code

The process of submitting a pull request is fairly straightforward,
and generally follows the same pattern each time:

1. [Create a new branch](#step-1-create-a-new-branch)
2. [Make your changes](#step-2-make-your-changes)
3. [Rebase onto upstream](#step-3-rebase-onto-upstream)
4. [Run the tests](#step-4-run-the-tests)
5. [Double check your submission](#step-5-double-check-your-submission)
6. [Push your changes](#step-6-push-your-changes)
7. [Submit the pull request](#step-7-submit-the-pull-request)

### Step 1: Create a new branch

The first step to sending a pull request is to create a new branch
in your `webhint` fork. Give the branch a descriptive name that best
illustrates what it is you’re fixing, such as:

```bash
git checkout -b fix-1234
```

You should do all of your development for the issue in this branch.

**Note:** Do not combine fixes for multiple issues into one branch.
Use a separate branch for each issue you’re working on.

### Step 2: Make your changes

Make the changes to the code, documentation, and tests, and once you
are done, commit the changes to your branch:

```bash
git add -A
git commit
```

#### Commit messages

Commit messages should have the following structure:

```text
<Tag>: Capitalized, summary (50 chars recommended)

If necessary, more detailed explanatory text and/or what this commit
fixes, wrapped to about 72 characters or so. The commit message should
be in the imperative: "Fix bug" and not "Fixed bug" or "Fixes bug."

- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

Fix #<issue>
```

The **first line** of the commit message (the summary) constitutes the
one-sentence description of the change. It must be 50 characters in
length or shorter, and should start with a `<Tag>` that is one of the
following:

* `Breaking` - for a backwards-incompatible changes.
* `Build` - changes to build process only.
* `Chore` - for refactoring, adding tests, etc. (anything that
   isn’t user-facing).
* `Docs` - changes to documentation only.
* `Fix` - for a bug fix.
* `New` - implemented a new feature.
* `Update` - for a dependency upgrade.

Here are some good commit message summary examples:

```text
Docs: Fix broken links in `pull-requests.md`
```

```text
New: Add hint to check life-work balance
```

```text
Build: Generate new Travis CI token
```

The **second line** should be left blank if there are other lines
after it.

**All other lines**, where possible, should be wrapped to about 72
characters.

If applicable, to refer to an issue, comment or URL not being resolved
by the commit or to link to more related information, use
**'Ref \<reference\>'** below the seperator(-------) and before
'Fix #\<issue\>'. For example: `Ref #1911`,
`Ref https://github.com/webhintio/hint/pull/1911#issuecomment-463715363`
or `Ref https://webhint.io/docs/contributor-guide`.

**Note**: The commit message structure is very important as we use
the messages in our automatic release process (determining the new
version number, updating the changelog, etc.).

### Step 3: Rebase onto upstream

Before you send the pull request, be sure to rebase onto the
[upstream source](development-environment.md). This ensures your
code is running on the latest available code.

```bash
git fetch upstream
git rebase upstream/main
```

### Step 4: Run the tests

After rebasing, be sure to run all of the tests once again to make
sure nothing broke:

```bash
yarn test
```

If there are any failing tests, update your code until all tests pass.

### Step 5: Double check your submission

With your code ready to go, this is a good time to double-check your
submission to make sure it follows our conventions. Here are the things
to check:

* The pull request must have a description. The description should
  explain what you did and how its effects can be seen.
* The change introduces no functional regression. Be sure to run
  `yarn test` to verify your changes before submitting a pull request.
* Make separate pull requests for unrelated changes. Large pull requests
  with multiple unrelated changes may be closed without merging.
* All changes must be accompanied by documentation and tests, even if
  the feature you’re working on previously had no documentation or tests.

### Step 6: Push your changes

Next, push your changes to your fork:

```bash
git push origin fix-1234
```

If you are unable to push because some references are old, do a forced
push instead:

```bash
git push -f origin fix-1234
```

### Step 7: Submit the pull request

Now you’re ready to send the pull request. Go to your `webhint` fork
and then follow the [GitHub documentation][github pr docs] on how to
send a pull request.

## Following Up

Once your pull request is sent, it’s time for the team to review it.
As such, please make sure to:

1. Monitor the [status of the Azure Pipelines build for your pull
   request][ap pr status].
   If it fails, please investigate why. We cannot merge pull requests
   that fail Azure Pipelines for any reason.
2. Respond to comments left on the pull request from team members.
   Remember, we want to help you land your code, so please be receptive
   to our feedback.
3. We may ask you to make changes, rebase, or squash your commits.

Before doing any of the following, make sure you are on the correct
branch:

```bash
git checkout fix-1234
```

### Updating the Commit Message

If your commit message is in the incorrect format, you’ll be asked
to update it. You can do so via:

```bash
git commit --amend
```

This will open up your editor so you can make changes. After that,
you’ll need to do a forced push to fork:

```bash
git push -f origin fix-1234
```

### Updating the Code

If we ask you to make code changes, there’s no need to close the pull
request and create a new one. Make your changes, and when you’re ready,
add your changes into the branch.

```bash
git add -A
git commit --amend
```

Then, do a forced push to your fork (this will also update the content
of your pull request).

```bash
git push -f origin fix-1234
```

### Rebasing

If your code is out-of-date, we might ask you to rebase. That means
we want you to apply your changes on top of the latest upstream code.
Make sure you have set up a [development environment](development-environment.md),
and then you can rebase using these commands:

```bash
git fetch upstream
git rebase upstream/main
```

You might find that there are merge conflicts when you attempt to
rebase. Please [resolve the conflicts][github resolve conflicts docs]
and then do a forced push to your branch:

```bash
git push -f origin fix-1234
```

<!-- Link labels: -->

[cla]: https://cla.js.foundation/webhintio/hint
[github pr docs]: https://help.github.com/articles/creating-a-pull-request
[github resolve conflicts docs]: https://help.github.com/articles/resolving-merge-conflicts-after-a-git-rebase/
[ap pr status]: https://dev.azure.com/webhint/webhint/_build?definitionId=3&_a=summary
