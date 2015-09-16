/**
 * @class circuits/ServiceFactory
 *
 * This class represents the primary way to access service objects.
 * It provides functionality to retrieve a circuits.Service instance based on a meta-data description
 * of a remote restful service. The returned service object acts a proxy to the remote service
 * containing convenience methods for invoking each method in the service (see circuits.Service).
 * It also provides a way to setup global plugins (see circuits.Plugin) that will apply to all
 * services obtained through the factory.
 *
 */
define([
    "./declare",
    "./ZypSMDReader",
    "./Service",
    "./PluginMatcher",
    "./util",
    "./log",
    "./ServiceQueue",
    "./NativeXhrDataProvider"
], function (
    declare,
    ZypSMDReader,
    Service,
    PluginMatcher,
    Util,
    logger,
    ServiceQueue,
    NativeXhrDataProvider
) {

    var util = new Util(),
        module = declare(null, {
            pluginMatcher: new PluginMatcher(),

            /**
             * @constructor - accepts a config object for global configuration containing:
             * {
             *      plugins - an array of global plugins to apply to services and service methods.
             *      provider - a data provider to use for services created from this factory.
             *      resolver - a function to resolve a passed string service name to an SMD.
             * }
             */
            constructor: function (config) {

                this.config = util.mixin({
                    plugins: [],
                    provider: new NativeXhrDataProvider({}),
                    resolver: function (serviceName) {
                        var object;
                        require({async: false}, [serviceName], function (Obj) {
                            object = Obj;
                        });
                        return object;
                    },
                    resolverByModel: function (modelName) {
                        var object;
                        require({async: false}, [modelName + "Service"], function (Obj) {
                            object = Obj;
                        });
                        return object;
                    }
                }, config);

            },

            /**
             * Returns an instance of a Service that can provide crud operations for a model.
             *
             * @param modelName - the model that will be served.
             * @param plugins - plugins for read/write and other operations, which modify default service method behavior
             * @return {circuits/Service} - the realized service.
             */
            getServiceForModel: function (modelName, plugins) {
                logger.debug("Getting service for model: " + modelName);
                var smd = this.config.resolverByModel(modelName);
                return this.getService(smd, plugins);
            },

            /**
             * Returns an instance of a Service using its name.
             *
             * @param serviceName - the string name of the service that can be resolved to an smd by the configured resolver.
             * @param plugins - plugins for read/write and other operations, which modify default service method behavior
             * @return {circuits.Service} - the realized service.
             */
            getServiceByName: function (serviceName, plugins) {
                logger.debug("Getting service: " + serviceName);
                var smd = this.config.resolver(serviceName);
                return this.getService(smd, plugins);
            },

            /**
             * Returns an instance of a service queue used to control the execution of more than one
             * service call.
             * @param config - configuration for the service queue.
             * {
             *    autoRefreshInterval: {Number} interval in milliseconds
             * }
             * @return {circuits.ServiceQueue} - the new queue.
             */
            getServiceQueue: function (config) {
                return new ServiceQueue(config || {});
            },

            /**
             * Returns an instance of a Service using its SMD.
             *
             * @param smd - the SMD instance to use for service parameters
             * @param callbacks - load and error handlers for each service method, or optionally globally. Empty defaults will be mixed in to avoid errors.
             * @param plugins - plugins for read/write and other operations, which modify default service method behavior
             * @return {circuits.Service} - the realized service.
             */
            getService: function (smd, plugins) {
                var reader = this.newReader(smd),
                    provider = this.config.provider,
                    matcher = this.pluginMatcher,
                    sentPlugins = plugins || [],
                    mixinPlugins = [],
                    pertinentMethods,
                    service;

                mixinPlugins = mixinPlugins.concat(
                    this.pluginMatcher.listForServiceOnly(util.serviceName(reader.getSchemaId()),
                        reader.getMethodNames(), "mixin", this.config.plugins),
                    this.pluginMatcher.listForServiceOnly(util.serviceName(reader.getSchemaId()),
                        reader.getMethodNames(), "mixin", sentPlugins)
                );

                service = new Service(reader, provider, this.config.plugins, sentPlugins);

                logger.debug("Mixin plugins for " + service.name, mixinPlugins);

                util.executePluginChain(mixinPlugins, function (plugin) {
                    // get method names to pass to mixin plugin.
                    pertinentMethods = matcher.matchingMethodNames(service.name, reader.getMethodNames(), plugin);
                    plugin.fn.call(plugin.scope || plugin, service, pertinentMethods);
                });

                return service;

            },

            /**
             * Adds a new plugin to the global configuration. The plugin will be used in appropriate (matching) service instances
             * as they are retrieved.
             *
             * @param {circuits.Plugin} the global plugin to add.
             */
            addPlugin: function (plugin) {
                this.config.plugins.push(plugin);
                logger.debug("Plugin: " + plugin.name + " has been added");
            },

            /**
             * Deletes a plugin from the ServiceFactory.
             *
             * @param {circuits.Plugin}
             */
            removePlugin: function (plugin) {
                this.removePluginByName(plugin.name, plugin.type);
                logger.debug("Plugin: " + plugin.name + " has been removed");
            },

            /**
             * Deletes a plugin from the ServiceFactory.
             */
            removePluginByName: function (name, type) {
                logger.debug("Attempting to remove plugin: " + name);
                var index, plug, plugs = this.config.plugins;
                for (index = 0; index < plugs.length; index += 1) {
                    plug = plugs[index];
                    if (plug.name === name && plug.type === type) {
                        plugs.splice(index, 1);
                        logger.debug("Plugin: " + name + " has been removed");
                        break;
                    }
                }
            },

            /**
             * Retrieves a reader capable of handling the passed service descriptor.
             *
             * @param {Object} smd - the service descriptor to retrieve a reader for.
             */
            newReader: function (smd) {
                // zyp format by default.
                var ret = new ZypSMDReader(smd, this.config.resolver);
                if (!smd.SMDVersion) {
                    //not zyp then fail.
                    throw new Error("Argument is not an SMD.");
                }
                return ret;
            }

        });
    return module;
});
