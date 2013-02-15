/**
 * Plugin that provides a built-in function to prefix a string for a given item's property with a configured value.
 * Typically used to add proxy/app path to a relative url property.
 * @cfg String
 * prefix Value to prefix to the  of each property. Should be sent on the Plugin's 'custom' object arg.
 * @cfg Array
 * properties List of property names to apply string prefix to its value. If the property is an array, the prefix will be added to each entry.
 * Should be sent on the Plugin's 'custom' object arg.
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

            this.type = "read";

            this.fn = function (item) {

                this.properties.forEach(function (property) {

                    var prop = item[property], index, length;

                    if (Object.prototype.toString.call(prop) === "[object Array]") {
                        for (index = 0, length = prop.length; index < length; index += 1) {
                            prop[index] = this.prefix + prop[index];
                        }
                    } else {
                        item[property] = this.prefix + prop;
                    }
                }, this);

            };

        }

    });

    return module;
});
