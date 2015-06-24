/**
 * "url" phase plugin to prepend a configured string to a url.
 * @cfg String
 * prefix The prefix to place on the front of the URL. Should be sent on the Plugin's 'custom' object arg.
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

            this.type = "url";

            this.fn = function (url) {

                return this.prefix + url;

            };

        }
    });

    return module;
});
