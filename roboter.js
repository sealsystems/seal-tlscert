'use strict';

const roboter = require('roboter');

// dummy require to avoid an unused dependencies error
require('eslint-config-seal');

const tlsSubject = '/C=DE/ST=Bavaria/L=Roettenbach/O=SEAL Systems AG/OU=COM/CN=localhost';
const cert = 'keys/localhost.selfsigned/cert.pem';
const key = 'keys/localhost.selfsigned/key.pem';
const combined = 'keys/localhost.selfsigned/cert-key-combined.pem';
const keyPk8 = 'keys/localhost.selfsigned/key-pk8.pem';

roboter.
  workOn('server').
  equipWith((task) => {
    task('universal/analyze', {
      src: ['**/*.js', '!node_modules/**/*.js', '!examples/**', '!coverage/**', '!temp/**', '!output/**'],
      rules: '.eslintrc'
    });
    task('universal/test-units', {
      src: 'test/**/*Test.js'
    });
    task('universal/shell', {
      'generate-cert': `openssl req -subj "${tlsSubject}" -nodes -x509 -newkey rsa:2048 -keyout ${key} -out ${cert} -days 3650 &&
        cat ${cert} > ${combined} &&
        cat ${key} >> ${combined} &&
        openssl pkcs8 -topk8 -inform PEM -outform PEM -nocrypt -in ${key} -out ${keyPk8}`,
      'show-cert': 'openssl x509 -in keys/localhost.selfsigned/cert.pem -text -noout'
    });
  }).
  start();
