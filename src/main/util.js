/**
 * circuits service methods.
 */
define([
    "./declare",
    "./log"
], function (
    declare,
    logger
) {

    var module = declare(null, {

            /**
             * Simple dojo.mixin replacement.
             */
            mixin: function (target, source) {
                for (var name in source) {
                    target[name] = source[name];
                }
                return target;
            },

            /**
             * Simple dojo.isArray replacement.
             */
            isArray: function (target) {
                return Object.prototype.toString.call(target) === "[object Array]";
            },

            /**
             * Simple isUndefined.
             */
            isUndefined: function (target) {
                return typeof (target) === "undefined";
            },

            /**
             * Returns a fully-qualified name for a service from one of several partial formats.
             */
            fullSchemaName: function (name, separator) {

                var fullName, sep = separator || "/";

                if (name.indexOf(sep) >= 0) {
                    fullName = name; //already got fully-qualified (theoretically)
                } else if (name.indexOf("Service") >= 0) {
                    fullName = "Schema" + sep + "services" + sep + name; //just got the service class name
                } else {
                    fullName = "Schema" + sep + "services" + sep + name + "Service"; //just got the service "object" name
                }

                logger.debug("Service util created full name [" + fullName + "] from [" + name + "]");

                return fullName;

            },

            /**
             * Returns just the 'normal' name of the service, e.g., 'CaseService'.
             * Accepts any full/partial format.
             */
            serviceName: function (name, separator) {
                var sep = separator || (name.indexOf(".") !== -1 ? "." : "/"),
                    fullName = this.fullSchemaName(name, sep);
                return fullName.substring(fullName.lastIndexOf(sep) + 1);
            },

            /**
             * Returns the short name of the service, referring to just the object that is the service's subject, e.g., 'Case'.
             * Accepts any full/partial format.
             */
            shortName: function (name) {
                return this.serviceName(name).replace("Service", "");
            },

            /**
             * Execute a plugin array, terminating if a plugin sets its stopProcessing property.
             * @param plugins - the array of plugins to execute.
             * @param func - the function to apply to each plugin, it accepts the plugin its single parameter.
             */
            executePluginChain: function (plugins, func) {
                var idx, plugin = null;
                // iterate to process in reverse order without side-effects.
                for (idx = 1; idx <= plugins.length; idx += 1) {
                    plugin = plugins[plugins.length - idx];
                    func(plugin);
                    if (plugin.stopProcessing) {
                        break;
                    }
                }
            }

        });
    return module;
});