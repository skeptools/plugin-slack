import * as slack from '@skeptools/provider-slack';
import { BasePerson, BaseProps, PersonBaseProps } from '@skeptools/skep-core';
import { Construct } from 'constructs';
import { Organization } from './organization';

export interface PersonProps extends BaseProps {
}

export class Person<RoleType> extends BasePerson<PersonProps, RoleType> {
  _slackUser: slack.dataSlackUser.DataSlackUser;

  constructor(
    scope: Construct,
    namespace: string,
    _: Organization,
    config: PersonProps & PersonBaseProps<RoleType>,
  ) {
    super(scope, namespace, config);

    this._slackUser = new slack.dataSlackUser.DataSlackUser(this, `${namespace}-user`, {
      queryType: 'email',
      queryValue: config.emailAddress,
    });
  }

  get userId() {
    return this._slackUser.id;
  }
}
