import { OrganizationProps, PersonProps, SkepStack, TeamProps } from '@skeptools/skep-core';
import { App } from 'cdktf';
import { Factory } from '../src';

type TeamType = 'team' | 'guild';
type RoleType = 'engineering' | 'product';

const fooBar = {
  firstName: 'Foo',
  lastName: 'Bar',
  emailAddress: 'foo.bar@example.com',
  role: 'engineering',
  integrations: {
    slack: {
      foo: 'bar',
    },
  },
} as PersonProps<Integrations, RoleType>;

const balBaz = {
  firstName: 'Bal',
  lastName: 'Baz',
  emailAddress: 'bal.baz@example.com',
  role: 'product',
  integrations: {
    slack: {
      foo: 'bal',
    },
  },
} as PersonProps<Integrations, RoleType>;

const people = { fooBar, balBaz };

const fooTeam = {
  name: 'Foo',
  leads: ['fooBar'],
  members: ['balBaz'],
  integrations: {
    slack: {
      foo: 'bar',
    },
  },
} as TeamProps<Integrations, PeopleKeys, TeamType>;

const barGuild = {
  name: 'Bar',
  leads: ['fooBar'],
  members: ['balBaz'],
  integrations: {
    slack: {},
  },
  type: 'guild',
} as TeamProps<Integrations, PeopleKeys, TeamType>;

const teams = { fooTeam, barGuild };

const organization: OrganizationProps<Integrations> = {
  name: 'Test',
  integrations: {
    slack: {
      foo: 'baz',
    },
  },
};

type PeopleKeys = Extract<keyof typeof people, string>;
type TeamKeys = Extract<keyof typeof teams, string>;
interface Integrations {
  slack: Factory<PeopleKeys, TeamType, RoleType>;
}

export class TestSkepStack extends SkepStack<Integrations, PeopleKeys, TeamKeys, TeamType, RoleType> {
  get defaultConfig() {
    return {
      team: {
        type: 'team' as TeamType,
      },
    };
  }

  load(
    orgConfig: OrganizationProps<Integrations>,
    peopleConfig: Record<PeopleKeys, PersonProps<Integrations, RoleType>>,
    teamConfig: Record<TeamKeys, TeamProps<Integrations, PeopleKeys, TeamType>>,
  ): Integrations {
    const slack = new Factory<PeopleKeys, TeamType, RoleType>(
      this,
      'slack',
      this.getOrganizationConfig(orgConfig, 'slack'),
      this.getPersonConfig(peopleConfig, 'slack'),
      this.getTeamConfig(teamConfig, 'slack'),
    );
    slack.load();
    return { slack };
  }
}

test('SkepStack', () => {
  const app = new App();
  new TestSkepStack(app, 'test-skep-stack', organization, people, teams);
  app.synth();
});