/*globals window, requirejs */
"use strict";

var tests = [];
for (var file in window.__karma__.files) {
    if (window.__karma__.files.hasOwnProperty(file)) {

        // We want to skip the dojo specific tests for now until it is broken out
        if (/[\/\\]Test\w+\.js$/.test(file) && !/.*Dojo.*\.js/.test(file)) {
            tests.push(file);
        }
    }
}

requirejs.config({
    // Karma serves files from '/base'
    baseUrl: '/base',

    paths: {
        'circuits': 'js',
        'test': 'test',
        'Schema': 'test/data/schema'
    },
    //*/
    // ask Require.js to load these files (all our tests)
    deps: tests,

    // start test run, once Require.js is done
    callback: window.__karma__.start
});