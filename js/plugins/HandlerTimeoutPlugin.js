"use strict";
/**
 * Plugin to provide a generic handler for a timeout.
 * - Existing timeout and onTimeout plugins are converted to this plugin.
 */
define([
    "../declare",
    "./HandlerPlugin"
], function (
    declare,
    HandlerPlugin
) {

    var module = declare(HandlerPlugin, {

        constructor: function () {
            this.statusPattern = "-1";
        }

    });

    return module;
});