"use strict";

module.exports = function (grunt) {

    grunt.initConfig({
        jshint: {
            src: ['main/**/*.js', 'test-mocha/**/*.js', '!node_modules/**/*.*'],
            options: {
                jshintrc: '.jshintrc'
            }
        },
        karma: {
            unit: {
                configFile: 'karma.conf.js',
                singleRun: true
            }
        },
        watch: {
            js: {
                files: ['main/**/*.js', '!**/node_modules/**'],
                tasks: ['lint', 'test']
            }
        },
        requirejs: {
            compile: {
                options: {
                    baseUrl: "./src/main",
                    paths: {
                        circuits: "."
                    },
                    name: "circuits",
                    out: "circuits-min.js"
                }
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-requirejs');
    grunt.loadNpmTasks('grunt-karma');

    grunt.registerTask('lint', ['jshint']);
    grunt.registerTask('test', ['karma']);
    grunt.registerTask('compile', ['requirejs']);
    grunt.registerTask('default', ['lint', 'test']);

};
