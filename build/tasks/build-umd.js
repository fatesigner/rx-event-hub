/**
 * build umd
 */

const path = require('path');
const gulp = require('gulp');
const log = require('fancy-log');
const webpack = require('webpack');

const runWebpack = function (options, isLog = false) {
  return new Promise(function (resolve, reject) {
    webpack(options, (err, stats) => {
      if (err || (stats && stats.compilation && stats.compilation.errors && stats.compilation.errors.length)) {
        if (!err) {
          err = stats.compilation.errors[0];
        }
        reject(err);
      } else {
        if (isLog) {
          log('[webpack]', stats.toString({ colors: true }));
        }
        resolve(stats);
      }
    });
  });
};

gulp.task('build-umd', async function () {
  const { OUTPUT_PATH, SRC_PATH } = require('../constants');

  // Build umd.js
  await runWebpack(
    {
      mode: 'production',
      entry: path.join(SRC_PATH, 'index.ts'),
      context: SRC_PATH,
      output: {
        path: path.join(OUTPUT_PATH, 'umd'),
        chunkFilename: 'rx-event-hub.umd.chunk.js',
        filename: 'rx-event-hub.umd.js',
        library: 'RxEventHub',
        libraryTarget: 'umd'
      },
      module: {
        rules: [{ test: /\.ts?$/, loader: 'ts-loader' }]
      },
      resolve: {
        extensions: ['.js', '.ts']
      }
    },
    true
  );
});
