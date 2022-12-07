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

    let slackGroup = new slack.usergroup.Usergroup(this, `${namespace}-group`, {
      handle: `${this.kebabSlug}-${this.type}`,
      name: this.name,
    });

    const channelIds = [];
    if (!this._props.noPrivateChannel) {
      let slackChannel = new slack.conversation.Conversation(this, `${namespace}-channel-private`, {

        name: `${appendIf(org.teamChannelPrefix, '-')}${this.kebabSlug}-only`,
        topic: this._props.homepage?.replace(/^/, '<')?.replace(/$/, '>') ?? this.name,
        purpose: 'Team-only',
        isPrivate: true,
        lifecycle: {
          ignoreChanges: ['topic', 'purpose'],
        },
        actionOnDestroy: 'archive',
      });
      channelIds.push(slackChannel.id);
    }

    if (!this._props.noPublicChannel) {
      let publicSlackChannel = new slack.conversation.Conversation(this, `${namespace}-channel-public`, {

        name: `${appendIf(org.teamChannelPrefix, '-')}${this.kebabSlug}`,
        topic: this._props.homepage?.replace(/^/, '<')?.replace(/$/, '>') ?? this.name,
        purpose: 'Team + Partners',
        isPrivate: false,
        lifecycle: {
          ignoreChanges: ['topic', 'purpose'],
        },
        actionOnDestroy: 'archive',
      });
      channelIds.push(publicSlackChannel.id);
    }

    new slack.usergroupMembers.UsergroupMembers(this, `${namespace}-group-members`, {
      usergroupId: slackGroup.id,
      members: getRecordValues(this._allPeople).map(person => person.userId).filter(id => id != null),
    });

    if (channelIds.length > 0) {
      new slack.usergroupChannels.UsergroupChannels(this, `${namespace}-group-channels`, {
        usergroupId: slackGroup.id,
        channels: channelIds,
      });
    }

    getRecordKeyValues(org.generateSubGroups(this._allPeople)).map(([name, groupPeople]) => {
      const groupMembers = getRecordValues(groupPeople).map(person => person.userId).filter(id => id != null);
      const kebabName = toKebabSlug(name);
      if (groupMembers.length > 0) {
        let subGroup = new slack.usergroup.Usergroup(this, `${namespace}-${kebabName}-group`, {
          handle: `${this.kebabSlug}-${kebabName}`,
          name: `${this.name} - ${toTitleCase(name)}`,
        });
        new slack.usergroupMembers.UsergroupMembers(this, `${namespace}-${kebabName}-group-members`, {
          usergroupId: subGroup.id,
          members: groupMembers,
        });
      }
    });
  }
}
