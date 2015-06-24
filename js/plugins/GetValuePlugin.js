/**
 * Mixin plugin that adds a getValue method to a service instance, emulating the getValue functionality
 * of the dojo Read API.
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

            this.type = "mixin";

            this.fn = function (service) {

                service.getValue = function (item, valueName, defaultValue) {
                    var value = item[valueName];
                    if (typeof value === "undefined") {
                        value = defaultValue;
                    }
                    return value;
                };

            };

        }
    });
    return module;
});
