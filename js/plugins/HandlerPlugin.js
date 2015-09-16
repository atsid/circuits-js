/**
 * Plugin to provide a generic handler for all response types. *
 */
define([
    "../declare",
    "../Plugin"
], function (
    declare,
    Plugin
) {
    var module = declare(Plugin, {

        constructor: function () {
            this.type = "handler";
            this.statusPattern = "\\.*";
        }

    });

    return module;
});