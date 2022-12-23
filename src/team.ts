import * as slack from '@skeptools/provider-slack';
import { appendIf, BaseProps, BaseTeam, getRecordKeyValues, getRecordValues, TeamBaseProps, toKebabSlug, toTitleCase } from '@skeptools/skep-core';
import { Construct } from 'constructs';
import { Organization } from './organization';
import { Person, PersonProps } from './person';

export interface TeamProps extends BaseProps {
  readonly noPrivateChannel?: boolean;
  readonly noPublicChannel?: boolean;
}

export class Team<
  TeamTypeType extends string,
  PersonKeyType extends string,
  RoleType
> extends BaseTeam<
  PersonKeyType,
  RoleType,
  PersonProps,
  Person<RoleType>,
  TeamTypeType,
  TeamProps
  > {
  constructor(
    scope: Construct,
    namespace: string,
    org: Organization,
    people: Record<PersonKeyType, Person<RoleType>>,
    config: TeamProps & TeamBaseProps<PersonKeyType, TeamTypeType>,
  ) {
    super(scope, namespace, people, config);

    const channelIds = [];
    const { noPrivateChannel = false, noPublicChannel = false } = this._props;
    const freeVersion = org.freeVersion;
    const topic = this._props.homepage?.replace(/^/, '<')?.replace(/$/, '>') ?? this.name;
    if (!(noPrivateChannel || freeVersion)) {
      // Don't create a private channel for freeVersion, because team members would need to be
      // manually added to it by the Slack token-holder account (which is likely a Slack app).
      let slackChannel = new slack.conversation.Conversation(this, `${namespace}-channel-private`, {

        name: `${appendIf(org.teamChannelPrefix, '-')}${this.kebabSlug}-only`,
        topic,
        purpose: 'Team-only',
        isPrivate: true,
        lifecycle: {
          ignoreChanges: ['topic', 'purpose'],
        },
        actionOnDestroy: 'archive',
      });
      channelIds.push(slackChannel.id);
    }

    if (!noPublicChannel) {
      let publicSlackChannel = new slack.conversation.Conversation(this, `${namespace}-channel-public`, {

        name: `${appendIf(org.teamChannelPrefix, '-')}${this.kebabSlug}`,
        topic,
        purpose: 'Team + Partners',
        isPrivate: false,
        lifecycle: {
          ignoreChanges: ['topic', 'purpose'],
        },
        actionOnDestroy: 'archive',
      });
      channelIds.push(publicSlackChannel.id);
    }

    if (!freeVersion) {
      let slackGroup = new slack.usergroup.Usergroup(this, `${namespace}-group`, {
        handle: `${this.kebabSlug}-${this.type}`,
        name: this.name,
      });

      new slack.usergroupMembers.UsergroupMembers(this, `${namespace}-group-members`, {
        usergroupId: slackGroup.id,
        members: getRecordValues(this._allPeople).map(person => person.userId),
      });

      if (channelIds.length > 0) {
        new slack.usergroupChannels.UsergroupChannels(this, `${namespace}-group-channels`, {
          usergroupId: slackGroup.id,
          channels: channelIds,
        });
      }
    }

    getRecordKeyValues(org.generateSubGroups(this._allPeople)).map(([name, groupPeople]) => {
      const groupMembers = getRecordValues(groupPeople).map(person => person.userId).filter(id => id != null);
      const kebabName = toKebabSlug(name);
      if (groupMembers.length > 0) {
        if (!freeVersion) {
          let subGroup = new slack.usergroup.Usergroup(this, `${namespace}-${kebabName}-group`, {
            handle: `${this.kebabSlug}-${kebabName}`,
            name: `${this.name} - ${toTitleCase(name)}`,
          });
          new slack.usergroupMembers.UsergroupMembers(this, `${namespace}-${kebabName}-group-members`, {
            usergroupId: subGroup.id,
            members: groupMembers,
          });
        }
      }
    });
  }
}
