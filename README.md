# medley

[![CI Status](https://github.com/mebble/medley/workflows/CI/badge.svg)](https://github.com/mebble/medley/actions)
[![NPM](https://img.shields.io/npm/v/@mebble/medley?logo=npm&labelColor=000&color=555)](https://www.npmjs.com/package/@mebble/medley)

## Table of Contents

- [Usage](#usage)
- [Installation](#installation)
    * [Using a package manager](#using-a-package-manager)
    * [Using a CDN](#using-a-cdn)
- [API Reference](#api-reference)
- [Contributing](#contributing)

## Usage

```typescript
import { MedleyConfig, startTimer } from "@mebble/medley";

const config: MedleyConfig = {
    name: 'Shoulder stretches',
    timer: {
        type: 'sequence',
        of: [{
            type: 'loop',
            times: 2,
            of: {
                type: 'sequence',
                of: [
                    { type: 'unit', name: 'Left shoulder', duration: 30 },
                    { type: 'unit', name: 'Rest', duration: 10 },
                    { type: 'unit', name: 'Right shoulder', duration: 30 },
                    { type: 'unit', name: 'Rest', duration: 10 },
                ]
            }
        }, {
            type: 'unit',
            name: 'Rest',
            duration: 30
        }]
    }
};

startTimer(config, event => {
    console.log(event)
});
```

## Installation

### Using a package manager

Install with any one of the following package managers:

```
npm install @mebble/medley
yarn add @mebble/medley
pnpm add @mebble/medley
```

### Using a CDN

If your JS code is placed within a `<script type="module">`, you can import as an ES module from a CDN:

```html
<script type="module">
    import medley from 'https://esm.sh/@mebble/medley';
</script>
```

Alternatively, you can import the bundle:

```html
<script src="https://cdn.jsdelivr.net/npm/@mebble/medley@latest/dist/index.umd.js"></script>
```

Here, the library will be available as the global variable `medley`.

## API Reference

The API reference is available on the [website](https://mebble.github.io/medley).

## Contributing

See the contribution guide at [CONTRIBUTING.md](CONTRIBUTING.md).
