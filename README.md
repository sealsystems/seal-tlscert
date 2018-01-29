# @sealsystems/node-tlscert

[![CircleCI](https://circleci.com/gh/sealsystems/seal-tlscert.svg?style=svg)](https://circleci.com/gh/sealsystems/seal-tlscert)
[![Appveyor](https://ci.appveyor.com/api/projects/status/dppvysvpsac398h0?svg=true)](https://ci.appveyor.com/project/Plossys/seal-tlscert)

@sealsystems/node-tlscert provides TLS key and certificate.

## Installation

```bash
npm install @sealsystems/tlscert
```

## Quick start

First you need to add a reference to seal-tlscert within your application.

```javascript
const tlscert = require('@sealsystems/tlscert');
```

To get the content of the certificate and private key from a specific directory, first you need to set the `TLS_DIR` environment variable:

```bash
export TLS_DIR=$(pwd)
```

Then, call the `get` function:

```javascript
const keystore = await tlscert.get();

console.log(keystore);
// => {
//       key: '...',
//       cert: '...',
//       ca: '...'
//       isFallback: true/false
//    }
```

If you do not set the environment variable, a default key and a default certificate will be returned. In this case the property `isFallback` is set to `true`.

```javascript
if (keystore.isFallback) {
  console.log('This is the fallback key and certificate provided by the module.');
}
```

Please note that the files must be called `key.pem`, `cert.pem` and `ca.pem`, and that they have to be stored in PEM format. Having a `ca.pem` file is optional.

## Self-signed certificate

This module uses a self-signed certificate if no other is provided. This certificate is valid for 10 years (3650 days to be exact ;-)). To see the details of the certificate, call:

```bash
npm run show-cert
```

To create a new one (with a new expiration date), run:

```bash
npm run generate-cert
```

Do not forget to release a new version in order to publish the created certificate.

BTW: It should be no problem if a system contains multiple versions of the self-signed certificate as long as they are not expired.

## Running the build

To build this module use [roboter](https://www.npmjs.com/package/roboter).

```bash
$ bot
```
