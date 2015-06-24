/**
 * Mixin plugin that wraps the service calls on a service with the configured wrapper
 * method. The signature of the wrapper method will include the standard service call
 * method as the final argument of the wrapper's signature.
 *
 * config should contain the following additional parameter:
 * {
     *    wrapperMethod: function (arg1, arg2, ...., standardCall) {}
     * }
 */
define([
    "../declare",
    "../Plugin"
], function (
    declare,
    Plugin
) {
    var module = declare(Plugin, {

        constructor: function (config) {
            this.type = "mixin";
            var wrapper = config.wrapperMethod;

            this.fn = function (service, methods) {
                methods.forEach(function (method) {
                    var oldmethod = service[method];
                    service[method] = function () {
                        var i, newArgs = [];
                        for (i = 0; i < arguments.length; i += 1) {
                            newArgs.push(arguments[i]);
                        }
                        newArgs.push(oldmethod);
                        wrapper.apply(this, newArgs);
                    };
                });
            };

        }

    });

    return module;
});
