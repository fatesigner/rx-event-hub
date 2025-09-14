/**
 * build commonjs
 */

const path = require('path');
const gulp = require('gulp');
const merge = require('merge2');
const ts = require('gulp-typescript');

gulp.task('build-cjs', async function () {
  const { OUTPUT_PATH, ROOT_PATH, SRC_PATH } = require('../constants');

  // Build command.js
  const TsProjectCMD = ts.createProject(path.join(ROOT_PATH, 'tsconfig.json'), {
    declaration: false,
    module: 'commonjs'
  });

  const tsResultCMD = await gulp
    .src([path.resolve(SRC_PATH, '**/*.ts'), '!' + path.resolve(SRC_PATH, '**/*.d.ts'), '!' + path.resolve(SRC_PATH, '**/*.test.ts')])
    .pipe(TsProjectCMD());

  merge([tsResultCMD.js.pipe(gulp.dest(path.join(OUTPUT_PATH, 'commonjs')))]);
});
