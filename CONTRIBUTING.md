# How to contribute

_This project was scaffolded with `yarn create vite medley --template vanilla-ts`_

## Requirements

- Node v16 or later
- pnpm

## Install project dependencies

```
pnpm install
```

## Run tests

```
pnpm test
pnpm test --reporter verbose
pnpm test:watch
```

## Debugging tests

Run the debugger through vitest like so:

```
pnpm test:debug
```

Then connect to the debugger from your browser or IDE.

For more info on debugging vitest, see [the vitest docs](https://vitest.dev/guide/debugging.html).

## Bump the package version

```
pnpm version patch --no-git-tag-version
pnpm version minor --no-git-tag-version
pnpm version major --no-git-tag-version
```

Then commit the changes

## Publish the package

First, commit and tag the latest commit with the new bumped version, prefixed with "v". Then push all changes along with the tags:

```
git commit
git tag v<new-version>
git push origin --follow-tags
```
