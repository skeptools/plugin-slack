# Skep: Slack plugin
A Slack implementation for [Skep](https://github.com/skeptools/skep-core).

## Features
This plugin will create the following for each team in the org:

1. A Slack user group for the team, so it can be called out in Slack with `@team-name`.
2. A Slack user group for each sub-team, e.g. `devs-only`, etc. Sub-teams are defined at the [org level](https://github.com/skeptools/skep-core/blob/main/src/organization.ts#L8) as a map of `sub-team-name` => `function that filters members of the team based on their Person properties`.
3. A private Slack channel for the team. The Slack user group is used to define membership in this channel. This can optionally be [turned off](./src/team.ts#L8). The standard prefix for the channel name is [defined at the org level](./src/organization.ts#L5).
4. A public Slack channel for the team. The Slack user group is used to define membership in this channel. This can optionally be [turned off](./src/team.ts#L9).
