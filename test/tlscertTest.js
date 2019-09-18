'use strict';

const path = require('path');

const assert = require('assertthat');
const nodeenv = require('nodeenv');

const tlscert = require('../lib/tlscert');

suite('tlscert', () => {
  test('is an object.', (done) => {
    assert.that(tlscert).is.ofType('object');
    done();
  });

  suite('get', () => {
    test('is a function.', (done) => {
      assert.that(tlscert.get).is.ofType('function');
      done();
    });

    suite('keystore', () => {
      test('is an object.', async () => {
        const keystore = await tlscert.get();

        assert.that(keystore).is.ofType('object');
      });

      suite('using environment variable TLS_DIR', () => {
        suite('that is not set', () => {
          let restoreEnvironment;

          suiteSetup((done) => {
            const restore = nodeenv('TLS_DIR', undefined);

            restoreEnvironment = restore;
            done();
          });

          suiteTeardown((done) => {
            restoreEnvironment();
            done();
          });

          test('contains a default key.', async () => {
            const keystore = await tlscert.get();

            assert.that(keystore.key).is.startingWith('-----BEGIN RSA PRIVATE KEY-----');
          });

          test('contains a default certificate.', async () => {
            const keystore = await tlscert.get();

            assert.that(keystore.cert).is.startingWith('-----BEGIN CERTIFICATE-----');
          });

          test('does not contain a default ca certificate.', async () => {
            const keystore = await tlscert.get();

            assert.that(keystore.ca).is.undefined();
          });

          test('sets isFallback to true.', async () => {
            const keystore = await tlscert.get();

            assert.that(keystore.isFallback).is.equalTo(true);
          });
        });

        suite('that is set to a directory', () => {
          let restoreEnvironment;

          suiteSetup((done) => {
            const restore = nodeenv('TLS_DIR', path.join(__dirname, 'keyCertCa'));

            restoreEnvironment = restore;
            done();
          });

          suiteTeardown((done) => {
            restoreEnvironment();
            done();
          });

          test('throws an error if the configured directory does not exist.', async () => {
            const restore = nodeenv('TLS_DIR', path.join(__dirname, 'does-not-exist'));

            await assert
              .that(async () => {
                await tlscert.get();
              })
              .is.throwingAsync();
            restore();
          });

          test('contains a key.', async () => {
            const keystore = await tlscert.get();

            assert.that(keystore.key).is.startingWith('key');
          });

          test('contains a certificate.', async () => {
            const keystore = await tlscert.get();

            assert.that(keystore.cert).is.startingWith('cert');
          });

          test('contains a ca certificate.', async () => {
            const keystore = await tlscert.get();

            assert.that(keystore.ca).is.startingWith('ca');
          });

          test('sets isFallback to false.', async () => {
            const keystore = await tlscert.get();

            assert.that(keystore.isFallback).is.equalTo(false);
          });

          suite('handles optional types', () => {
            test('ignores a missing ca certificate.', async () => {
              const restore = nodeenv('TLS_DIR', path.join(__dirname, 'keyCert'));

              await assert
                .that(async () => {
                  await tlscert.get();
                })
                .is.not.throwingAsync();
              restore();
            });

            test('throws an error if the key is missing.', async () => {
              const restore = nodeenv('TLS_DIR', path.join(__dirname, 'certCa'));

              await assert
                .that(async () => {
                  await tlscert.get();
                })
                .is.throwingAsync();
              restore();
            });

            test('throws an error if the certificate is missing.', async () => {
              const restore = nodeenv('TLS_DIR', path.join(__dirname, 'keyCa'));

              await assert
                .that(async () => {
                  await tlscert.get();
                })
                .is.throwingAsync();
              restore();
            });
          });
        });
      });

      suite('using another environment variable', () => {
        test('contains a default certificate if not set.', async () => {
          const restore = nodeenv('TLS_FOO', undefined);
          const keystore = await tlscert.get('TLS_FOO');

          assert.that(keystore.cert).is.startingWith('-----BEGIN CERTIFICATE-----');
          restore();
        });

        test('contains a certificate if set.', async () => {
          const restore = nodeenv('TLS_FOO', path.join(__dirname, 'keyCertCa'));
          const keystore = await tlscert.get('TLS_FOO');

          assert.that(keystore.cert).is.startingWith('cert');
          restore();
        });
      });
    });
  });
});
