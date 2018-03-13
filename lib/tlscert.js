'use strict';

const fs = require('fs');
const path = require('path');
const util = require('util');

const _ = require('lodash');
const processenv = require('processenv');

const log = require('@sealsystems/log').getLogger();

const readFile = util.promisify(fs.readFile);

let isWarningLogged = false;

const types = {
  key: { optional: false },
  cert: { optional: false },
  ca: { optional: true }
};

const tlscert = {};

tlscert.cache = {};

tlscert.get = async function (env = 'TLS_DIR') {
  log.debug(`Using environment variable ${env}.`);

  let directory = processenv(env);
  let isFallback = false;

  if (!directory) {
    isFallback = true;
    directory = path.join(__dirname, '..', 'keys', 'localhost.selfsigned');

    /* eslint-disable no-process-env */
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
    /* eslint-enable no-process-env */

    if (!isWarningLogged) {
      log.warn('Using self-signed certificate. TLS checks disabled.');
      isWarningLogged = true;
    }
  }

  if (tlscert.cache[directory]) {
    return _.cloneDeep(tlscert.cache[directory]);
  }

  const result = {
    isFallback
  };

  const keys = Object.keys(types);

  for (let i = 0; i < keys.length; i++) {
    const type = keys[i];
    const fileName = path.join(directory, `${type}.pem`);

    try {
      result[type] = await readFile(fileName, 'utf8');
    } catch (e) {
      if (!types[type].optional) {
        throw e;
      }

      // Silently ignore the error, as we only export those things that are
      // actually present in the file system.
      log.info(`Ignoring missing ${type} certificate.`, { directory });
    }
  }

  tlscert.cache[directory] = _.cloneDeep(result);

  return result;
};

module.exports = tlscert;
