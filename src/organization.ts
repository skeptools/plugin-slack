import { BaseOrganization, BaseProps, OrganizationBaseProps } from '@skeptools/skep-core';
import { Construct } from 'constructs';

export interface OrganizationProps extends BaseProps {
  /**
   * Indicates whether the Slack workspace is free or paid, because some features
   * are not available to the free version and should not be managed by this plugin.
   *
   * @default - false
   */
  readonly freeVersion?: boolean;
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

  get freeVersion() {
    return this._props.freeVersion ?? false;
  }

  get teamChannelPrefix() {
    return this._props.teamChannelPrefix;
  }
}
