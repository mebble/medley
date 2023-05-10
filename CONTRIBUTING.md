# How to contribute

_This project was scaffolded with `yarn create vite medley --template vanilla-ts`_

## Requirements

- Node v16 or later
- yarn

## Install project dependencies

```
yarn install
```

## Run tests

```
yarn test
yarn test --reporter verbose
yarn test:watch
```

## Bump the package version

```
yarn version --no-git-tag-version --patch
yarn version --no-git-tag-version --minor
yarn version --no-git-tag-version --major
```

Then commit the changes

## Publish the package

Tag the commit with the new bumped version (prefixed with "v"), then push that tag:

```
git tag v<new-version>
git push origin v<new-version>
```
