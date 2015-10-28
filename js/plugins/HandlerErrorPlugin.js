"use strict";
/**
 * Plugin to provide a generic handler for an error response.
 * - Existing error and onError plugins are converted to this plugin.
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
            this.statusPattern = "(4|5)\\d\\d";
        }

    });

    return module;
});