import { BaseOrganization, BaseProps, OrganizationBaseProps } from '@skeptools/skep-core';
import { Construct } from 'constructs';

export interface OrganizationProps extends BaseProps {
  readonly teamChannelPrefix?: string;
}

export class Organization extends BaseOrganization<OrganizationProps> {
  constructor(
    scope: Construct,
    namespace: string,
    config: OrganizationProps & OrganizationBaseProps,
  ) {
    super(scope, namespace, config);
  }

  get teamChannelPrefix() {
    return this._props.teamChannelPrefix;
  }
}
