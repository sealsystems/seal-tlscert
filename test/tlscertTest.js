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
      test('is an object.', (done) => {
        assert.that(tlscert.get()).is.ofType('object');
        done();
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

          test('contains a default key.', (done) => {
            assert.that(tlscert.get().key).is.startingWith('-----BEGIN RSA PRIVATE KEY-----');
            done();
          });

          test('contains a default certificate.', (done) => {
            assert.that(tlscert.get().cert).is.startingWith('-----BEGIN CERTIFICATE-----');
            done();
          });

          test('does not contain a default ca certificate.', (done) => {
            assert.that(tlscert.get().ca).is.undefined();
            done();
          });

          test('sets isFallback to true.', (done) => {
            assert.that(tlscert.get().isFallback).is.equalTo(true);
            done();
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

          test('throws an error if the configured directory does not exist.', (done) => {
            const restore = nodeenv('TLS_DIR', path.join(__dirname, 'does-not-exist'));

            assert.that(() => {
              tlscert.get();
            }).is.throwing();
            restore();
            done();
          });

          test('contains a key.', (done) => {
            assert.that(tlscert.get().key).is.startingWith('key');
            done();
          });

          test('contains a certificate.', (done) => {
            assert.that(tlscert.get().cert).is.startingWith('cert');
            done();
          });

          test('contains a ca certificate.', (done) => {
            assert.that(tlscert.get().ca).is.startingWith('ca');
            done();
          });

          test('sets isFallback to false.', (done) => {
            assert.that(tlscert.get().isFallback).is.equalTo(false);
            done();
          });

          suite('handles optional types', () => {
            test('ignores a missing ca certificate.', (done) => {
              const restore = nodeenv('TLS_DIR', path.join(__dirname, 'keyCert'));

              assert.that(() => {
                tlscert.get();
              }).is.not.throwing();
              restore();
              done();
            });

            test('throws an error if the key is missing.', (done) => {
              const restore = nodeenv('TLS_DIR', path.join(__dirname, 'certCa'));

              assert.that(() => {
                tlscert.get();
              }).is.throwing();
              restore();
              done();
            });

            test('throws an error if the certificate is missing.', (done) => {
              const restore = nodeenv('TLS_DIR', path.join(__dirname, 'keyCa'));

              assert.that(() => {
                tlscert.get();
              }).is.throwing();
              restore();
              done();
            });
          });
        });
      });

      suite('using another environment variable', () => {
        test('contains a default certificate if not set.', (done) => {
          const restore = nodeenv('TLS_FOO', undefined);

          assert.that(tlscert.get('TLS_FOO').cert).is.startingWith('-----BEGIN CERTIFICATE-----');
          restore();
          done();
        });

        test('contains a certificate if set.', (done) => {
          const restore = nodeenv('TLS_FOO', path.join(__dirname, 'keyCertCa'));

          assert.that(tlscert.get('TLS_FOO').cert).is.startingWith('cert');
          restore();
          done();
        });
      });
    });
  });
});
