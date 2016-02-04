'use strict';

var babel = require('babel-core')
  , async = require('async')
  , fs = require('fs')
  , fhlog = require('fhlog')
  , log = fhlog.getLogger('[rhmap-parse]')
  , path = require('path')
  , walk = require('walk')
  , rmdir = require('rmdir')
  , copyDir = require('copy-dir')
  , RH_PARSE_DIR = './rh-parse-server'
  , PARSE_DIR = path.dirname(require.resolve('parse-server'));


// Needed to ensure certain functions in the converted code will work
require('babel-polyfill');


/**
 * fhlog instance used by this
 * @type {Object}
 */
exports.fhlog = fhlog;


/**
 * fhlog.Logger instance used by this
 * @type {Object}
 */
exports.logger = log;


/**
 * Configures this deployment with parse-server code that can be run on
 * Node 0.10.30 i.e ES5 code generated from the ES6 files in parse-server
 * @param  {Function} done
 */
exports.configure = function (done) {
  if (!fs.existsSync(path.join(__dirname, RH_PARSE_DIR))) {
    log.d('Creating directory for converted parse files');
    fs.mkdirSync(path.join(__dirname, RH_PARSE_DIR));
  }

  async.series([
    removeOldParseCode,
    copyNewParseCode,
    startFileConversion
  ], onComplete);

  function onComplete (err) {
    if (err) {
      log.e('Error loading parse-server code');
    } else {
      log.d('Generating require hooks for parse module');

      require.cache[require.resolve('parse-server')] = {};
      require.cache[require.resolve('parse-server')]
        .exports = {};
      require.cache[require.resolve('parse-server')]
        .exports = require(RH_PARSE_DIR);

      log.d('Loaded parse-server code successfully');
    }

    done(err);
  }
};


/**
 * Clean up old parse server code if required.
 * @param  {Function} done
 */
function removeOldParseCode (done) {
  log.d(
    'Remove old parse-server code from local directory: %s',
    RH_PARSE_DIR
  );

  rmdir(path.join(__dirname, RH_PARSE_DIR), done);
}


/**
 * We need to copy the entire parse module folder due to permissions etc.
 * on the RHMAP that make this conversion fail otherwise
 */
function copyNewParseCode (done) {
  log.d('Copying parse-server to local directory: %s', RH_PARSE_DIR);
  try {
    copyDir.sync(PARSE_DIR, RH_PARSE_DIR);
    done();
  } catch (e) {
    done(e);
  }
}


/**
 * We need to traverse the parse-server code and convert each file to ES5 format
 * @param  {Function} done
 */
function startFileConversion (done) {
  log.d(
    'Begin walking files for conversion in: %s',
    path.dirname(require.resolve('parse-server'))
  );

  var walker = walk.walk(RH_PARSE_DIR, {});
  walker.on('file', covertFileToES5);
  walker.on('end', done);
}


/**
 * Converts a given file to ES5 format
 * @param  {String}   dir
 * @param  {Object}   file
 * @param  {Function} done
 */
function covertFileToES5 (dir, file, done) {
  var fp = path.join(dir, file.name);

  if (path.extname(file.name) === '.js' && fp.indexOf('node_modules') === -1) {
    log.d('Converting file to ES5: %s', fp);

    fs.writeFile(
      fp,
      babel.transformFileSync(fp, {
        presets: [require('babel-preset-es2015')]
      }).code,
      function (err) {
        if (err) {
          log.e(
            'Failed to write ES5 code to module file: %s',
            fp
          );
          done(err);
        } else {
          log.d('Conversion success for: %s', fp);
          done();
        }
      }
    );
  } else {
    done();
  }
}
