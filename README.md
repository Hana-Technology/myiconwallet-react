# MyIconWallet · [![Netlify Status](https://api.netlify.com/api/v1/badges/807b7627-4bc5-48cd-bbbf-6908557bd8ed/deploy-status)](https://app.netlify.com/sites/my-icon-wallet/deploys)

An **Icon** web wallet — by the **community**, for the community.

## Developing

### Getting Started

To get started, clone the repository, install dependencies then run it locally.

```bash
git clone https://github.com/ReliantNode/myiconwallet-react.git
cd myiconwallet-react
yarn
yarn start
```

### Testing

Running tests by default will use the [Jest](https://jestjs.io/) interactive watch mode and only watch changed files.

```bash
# Interactive watch mode on changed files only
yarn test

# Interactive watch mode on all files
yarn test --all

# Single run of the full test suite
yarn test --watchAll=false
```

### Formatting

All source code is formatted using the opinionated code formatter [Prettier](https://prettier.io/). You can set it up to run in your development environment, but we have also setup a pre-commit hook which will automatically format any git staged files.

## Continuous Integration / Continuous Delivery

MyIconWallet is using [Netlify](https://www.netlify.com/) for CI/CD meaning that any merges into the `master` branch are automatically deployed to [www.myiconwallet.com](http://www.myiconwallet.com/). Additionally any pull requests will get an automatically generated deploy preview link. The status of Netlify deploys is visible at [app.netlify.com/sites/my-icon-wallet/deploys](https://app.netlify.com/sites/my-icon-wallet/deploys).

Netlify runs the commands `yarn format:check`, `yarn test --watchAll=false` then `yarn build`. All commands must finish successfully for a successful deploy.

## Contributing

MyIconWallet is open to contributions and pull requests from the community. We will try to label [good first issues](https://github.com/ReliantNode/myiconwallet-react/labels/good%20first%20issue) when possible.

MyIconWallet adheres to the [Contributor Covenant Code of Conduct](./CODE_OF_CONDUCT.md).

## License

MyIconWallet is licensed under the [MIT license](./LICENSE.md).
