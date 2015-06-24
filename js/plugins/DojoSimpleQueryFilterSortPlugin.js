/**
 * Plugin that does a client-side filter of the service method's last-loaded data items.
 * Uses the dojo SimpleQueryEngine, which can filter and sort JSON lists with a jsonPath expression.
 */
define([
    "../declare",
    "../log",
    "../Plugin",
    "dojo/store/util/SimpleQueryEngine"
], function (
    declare,
    logger,
    Plugin,
    QueryEngine
) {
    var module = declare(Plugin, {

            constructor: function () {

                var that = this;

                this.type = "mixin";

                this.queryEngine = QueryEngine;

                this.fn = function (service) {

                    service.filterAndSort = function (params, callbacks) {

                        var method = service.getMethod(params.methodName),
                            items = method.data; //assumes the method instance cached its response, and that this is only used if 'items' is an array
                        logger.info("filter/sort of service data from [" + service.name + "." + params.methodName + "]", params);
                        try {
                            items = that.filter(params.filter, params.sort, items);
                            if (callbacks.onLoad) {
                                callbacks.onLoad.call(callbacks.scope, items);
                            }
                        } catch (e) {
                            if (callbacks.onError) {
                                callbacks.onError.call(callbacks.scope);
                            } else {
                                logger.error("Plugin: " + that.declaredClass + " got exception " + e + " in service " + service.name);
                            }
                        }

                    };

                };

            },

            filter: function (filter, sort, items) {
                return this.queryEngine(filter, {sort: sort})(items);
            }

        });
    return module;
});
