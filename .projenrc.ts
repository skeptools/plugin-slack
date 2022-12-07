import { SkepPluginProject } from '@skeptools/skep-plugin-project';
const project = new SkepPluginProject({
  cdktfProviderPackage: '@skeptools/provider-slack',
  defaultReleaseBranch: 'main',
  devDeps: ['@skeptools/skep-plugin-project'],
  name: 'plugin-slack',
  projenrcTs: true,

  // deps: [],                /* Runtime dependencies of this module. */
  // description: undefined,  /* The description is just a string that helps people understand the purpose of the package. */
  // packageName: undefined,  /* The "name" in package.json. */
});
project.synth();