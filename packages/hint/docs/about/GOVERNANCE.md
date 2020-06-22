# Governance

`webhint` is an open source project that depends on contributions
from the community. Anyone may contribute to the project at any time
by submitting code, participating in discussions, making suggestions,
or any other contribution they see fit. This document describes how
various types of contributors work within the `webhint` project.

## Roles and Responsibilities

### Users

Users are community members who have a need for the project.
Anyone can be a User; there are no special requirements. Common User
contributions include evangelizing the project (e.g., display a link
on a website and raise awareness through word-of-mouth), informing
developers of strengths and weaknesses from a new user perspective,
or providing moral support (a "thank you" goes a long way).

Users who continue to engage with the project and its community will
often become more and more involved. Such Users may find themselves
becoming Contributors, as described in the next section.

### Contributors

Contributors are community members who contribute in concrete ways
to the project, most often in the form of code and/or documentation.
Anyone can become a Contributor, and contributions can take many
forms. There is no expectation of commitment to the project, no
specific skill requirements, and no selection process.

Contributors have read-only access to source code and so submit changes
via pull requests. Contributor pull requests have their contribution
reviewed and merged by a TSC member. TSC members and Committers work
with Contributors to review their code and prepare it for merging.

As Contributors gain experience and familiarity with the project, their
profile within, and commitment to, the community will increase. At some
stage, they may find themselves being nominated for committership by an
existing Committer.

### Committers

Committers are community members who have shown that they are committed
to the continued development of the project through ongoing engagement
with the community. Committers are given push access to the project’s
GitHub repos and must abide by the project’s Contribution Guidelines.

Committers:

* Are expected to work on public branches of their forks and submit
  pull requests to the main branch.
* Must submit pull requests for all changes.
* Have their work reviewed by TSC members before acceptance into the
  repository.
* May label and close issues.
* May merge some pull requests.

To become a Committer:

* One must have shown a willingness and ability to participate in
  the project as a team player. Typically, a potential Committer
  will need to show that they have an understanding of and alignment
  with the project, its objectives, and its strategy.
* Committers are expected to be respectful of every community member
  and to work collaboratively in the spirit of inclusion.
* Have submitted a significant amount of qualifying pull requests.
  What’s a qualifying pull request? One that carries significant
  technical weight and requires little effort to accept because it’s
  well documented and tested.

New Committers can be nominated by any existing Committer. Once they
have been nominated, there will be a vote by the TSC members.

It is important to recognize that committership is a privilege, not a
right. That privilege must be earned and once earned it can be removed
by the TSC members by a standard TSC motion. However, under normal
circumstances committership exists for as long as the Committer wishes
to continue engaging with the project.

A Committer who shows an above-average level of contribution to the
project, particularly with respect to its strategic direction and
long-term health, may be nominated to become a TSC member, described
below.

### Technical Steering Committee (TSC)

The `webhint` project is jointly governed by a Technical Steering
Committee (TSC) which is responsible for high-level guidance of
the project.

The TSC has final authority over this project including:

* Technical direction of the project as well as hint guidance.
* Project governance and process (including this policy).
* Contribution policy.
* GitHub repository hosting.

TSC seats are not time-limited. There is no fixed size of the TSC.
The TSC should be of such a size as to ensure adequate coverage
of important areas of expertise balanced with the ability to make
decisions efficiently.

The TSC may add additional members to the TSC by a standard TSC motion.

A TSC member may be removed from the TSC by voluntary resignation,
or by a standard TSC motion.

Changes to TSC membership should be posted in the agenda, and may
be suggested as any other agenda item (see "TSC Meetings" below).

No more than 1/3 of the TSC members may be affiliated with the same
employer. If removal or resignation of a TSC member, or a change of
employment by a TSC member, creates a situation where more than 1/3
of the TSC membership shares an employer, then the situation must
be immediately remedied by the resignation or removal of one or more
TSC members affiliated with the over-represented employer(s) or the
addition of a new representative not affiliated with the
over-represented employer(s). The exception to this is when there
are not enough members (e.g.: 2 people will be 50%).

TSC members have additional responsibilities over and above those of
a Committer. These responsibilities ensure the smooth running of the
project. TSC members are expected to review code contributions, approve
changes to this document, manage the copyrights within the project
outputs, and participate in the TSC discussions and meetings.

TSC members fulfill all requirements of Committers, and also:

* May merge external pull requests for accepted issues upon reviewing
  and approving the changes.
* May merge their own pull requests once they have collected the
  feedback they deem necessary. (No pull request should be merged
  without at least one Committer/TSC member comment stating they’ve
  looked at the code.)

To become a TSC member one most fulfill at least 2 of the following
items and commit to being a part of the community for the long-term.

* Work in a helpful and collaborative way with the `webhint` and/or
  web communities.
* Have given good feedback on others’ submissions and displayed an
  overall understanding of the code quality standards for the project.
* Be an expert in a web related area, e.g.: browser internals,
  accessibility, security, performance, etc.

An individual is invited to become a TSC member by existing TSC members.
A nomination will result in discussion and then a decision by the TSC.

#### Meetings

The webhint team tries to meet every 2 weeks (length of a sprint)
on Zoom, and to stream the meeting on YouTube.

The intention of the agenda is to summarize the work done during the
last period, and decide priorities for the next one. It is not to
approve or review all patches. That should happen continuously on
GitHub and be handled by the larger group of Committers.

Other items that can be discussed during these meetings are
cross-project collaboration, modifications of governance,
contribution policy, TSC membership, release process,  etc.

Any community member or committer can ask that something be added
to the next meeting’s agenda by logging a GitHub Issue. Anyone can
add the item to the agenda by adding the "TSC agenda" tag to the issue.

Additional meetings can be scheduled when required, at a time that
works for the TSC members. An example of such a meeting will be
when defining what a hint should do (or when proposing an update),
there is not an initial agreement in the GitHub discussion, and action
needs to be taken.

Prior to each TSC meeting, the moderator will share the Agenda with
members of the TSC. TSC members can add any items they like to the
agenda at the beginning of each meeting. The moderator and the TSC
cannot veto or remove items.

The TSC may invite persons or representatives from certain projects
to participate in a non-voting capacity.

The moderator is responsible for summarizing the discussion of each
agenda item.

## Consensus Seeking Process

The TSC follows a [Consensus Seeking][consensus seeking] decision
making model.

When an agenda item has appeared to reach a consensus, the moderator
will ask "Does anyone object?" as a final call for dissent from the
consensus.

If an agenda item cannot reach a consensus, a TSC member can call for
either a closing vote or a vote to table the issue to the next meeting.
The call for a vote must be approved by a majority of the TSC or else
the discussion will continue. Simple majority wins.

When discussing details on how a hint should work, the same consensus
principle applies, with the difference that it is seeked in the related
GitHub issue.

----

This work is a derivative of [ESLint Governance][eslint governance],
[YUI Contributor Model][yui contributor model], and the [JS Foundation
TAC Charter][js foundation tac charter].

This work is licensed under a [Creative Commons Attribution-ShareAlike
2.0 UK: England & Wales License][cc].

<!-- Link labels: -->

[cc]: https://creativecommons.org/licenses/by-sa/2.0/uk/
[consensus seeking]: https://en.wikipedia.org/wiki/Consensus-seeking_decision-making
[eslint governance]: https://github.com/eslint/eslint.github.io/blob/14196f4f4fd0d0be5a2f2a972929fd30f6c26d46/docs/maintainer-guide/governance.md
[js foundation tac charter]: https://github.com/JSFoundation/TAC/blob/1aacc0c8be7b3bdf93519befcd15c5be8c000330/TAC-Charter.md
[OpenJS Foundation]: https://openjsf.org/
[webhint org]: https://github.com/webhintio/
[yui contributor model]: https://github.com/yui/yui3/wiki/Contributor-Model
