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

First, push all changes on the main branch. Then tag the latest commit with the new bumped version, prefixed with "v". Then push that tag:

```
git push
git tag v<new-version>
git push origin v<new-version>
```