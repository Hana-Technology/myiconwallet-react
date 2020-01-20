module.exports = (config, env) => {
  const configRewiredYarnWorkspaces = require('react-app-rewire-yarn-workspaces')(config, env);
  return require('react-app-rewire-postcss')(configRewiredYarnWorkspaces, true);
};
