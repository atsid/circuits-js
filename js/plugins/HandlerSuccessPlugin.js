/**
 * Plugin to provide a generic handler for a success response.
 * - Existing success, load and onLoad plugins are converted to this plugin.
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
            this.statusPattern = "(2|3)\\d\\d";
        }

    });

    return module;
});