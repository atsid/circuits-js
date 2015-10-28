"use strict";
/**
 * @class {circuits.Service}
 * First class wrapper object for working with services defined in SMDs.
 * In addition to the functions that are defined here, an additional
 * function for each method on the SMD will be added dynamically, which
 * wraps a call to the circuits.ServiceMethod's invoke function. Therefore, any given
 * Service instance can be used to directly invoke the methods defined for the
 * REST service itself.
 */
define([
    "./declare",
    "./ServiceMethod",
    "./PluginMatcher",
    "./util",
    "./log",
    "./plugins/HandlerErrorPlugin",
    "./plugins/HandlerSuccessPlugin",
    "./NativeJsonpDataProvider",
    "./plugins/HandlerTimeoutPlugin"
], function (
    declare,
    ServiceMethod,
    PluginMatcher,
    Util,
    logger,
    HandlerErrorPlugin,
    HandlerSuccessPlugin,
    NativeJsonpDataProvider,
    HandlerTimeoutPlugin
) {

    var util = new Util(),
        module = declare(null, {
            /**
             * @constructor
             * @param reader - Reader instance that has methods for getting RESTful service parameters needed to invoke an HTTP endpoint
             * @param provider - a DataProvider that can take a URL and return data
             * @param plugins - an array of plugins to apply to this service in general See circuits.Plugin.
             */
            constructor: function (reader, provider, factoryPlugins, servicePlugins) {

                var that = this,
                    methodsHash = {},
                    methodsArr = [],
                    schemaId = reader.getSchemaId(),
                    transport = reader.getTransport();

                logger.debug("Creating new Service based on schema: " + schemaId);
                logger.debug("Got service plugins", servicePlugins);
                logger.debug("Got factory plugins", factoryPlugins);
                this.reader = reader;
                this.name = util.serviceName(schemaId);
                this.factoryPlugins = factoryPlugins;
                this.plugins = servicePlugins;
                this.pluginMatcher = new PluginMatcher();

                //if JSONP transport is not supported by the existing provider
                if (transport === 'JSONP' && !provider.supportsTransport('JSONP')) {
                    this.addPlugin({
                        type: 'provider',
                        fn: function () {
                            return new NativeJsonpDataProvider({});
                        }
                    });
                }

                //instantiate and hash ServiceMethods on the Service
                reader.getMethodNames().forEach(function (methodName) {
                    var serviceMethod = new ServiceMethod(methodName, reader, provider);
                    methodsHash[methodName] = serviceMethod;
                    methodsArr.push(serviceMethod);

                    //now add actual functional method directly on the Service for each one defined
                    this[methodName] = function (params, overridePlugins) {

                        var passedPlugins = that.convertCallbackParam(overridePlugins),
                            plugs = that.resolvePlugins(methodName, passedPlugins);

                        return serviceMethod.invoke(params, plugs);
                    };

                }, this);

                /**
                 * Returns a ServiceMethod instance matching the specified name.
                 */
                this.getMethod = function (methodName) {
                    return methodsHash[methodName];
                };

                /**
                 * Converts the passed param object to an array of plugins if necessary.
                 * @param {Object | Array} a set of circuits.Plugin's or an object of the form:
                 * {
                 *  load: {load function, optional}
                 *  error: {error function, optional}
                 *  scope: {Object scope for above functions}
                 * }
                 *
                 * @return {Array} the array of plugins converted if necessary.
                 */
                this.convertCallbackParam = function (param) {
                    var ret = param || [], plugin;

                    if (param && Object.prototype.toString.call(param) !== "[object Array]") {
                        ret = [];
                        if (param.timeout) {
                            logger.debug("Generating handler plugin on timeout (timeout)");
                            plugin = {name: 'generatedHandlerTimeout', fn: param.timeout};
                            plugin.scope = param.scope || plugin;
                            ret.push(new HandlerTimeoutPlugin(plugin));
                        }
                        if (param.load) {
                            logger.debug("Generating handler plugin on load (load)");
                            plugin = {name: 'generatedHandlerSuccess', fn: param.load};
                            plugin.scope = param.scope || plugin;
                            ret.push(new HandlerSuccessPlugin(plugin));
                        }
                        if (param.error) {
                            logger.debug("Generating handler plugin on error (error)");
                            plugin = {name: 'generatedHandlerError', fn: param.error};
                            plugin.scope = param.scope || plugin;
                            ret.push(new HandlerErrorPlugin(plugin));
                        }
                        if (param.onTimeout) {
                            logger.debug("Generating handler plugin on timeout (onTimeout)");
                            plugin = {name: 'generatedHandlerTimeout', fn: param.timeout};
                            plugin.scope = param.scope || plugin;
                            ret.push(new HandlerTimeoutPlugin(plugin));
                        }
                        if (param.onLoad) {
                            logger.debug("Generating handler plugin on load (onLoad)");
                            plugin = {name: 'generatedHandlerSuccess', fn: param.onLoad};
                            plugin.scope = param.scope || plugin;
                            ret.push(new HandlerSuccessPlugin(plugin));
                        }
                        if (param.success) {
                            logger.debug("Generating handler plugin for load (success)");
                            plugin = {name: 'generatedHandlerSuccess', fn: param.success};
                            plugin.scope = param.scope || plugin;
                            ret.push(new HandlerSuccessPlugin(plugin));
                        }
                        if (param.onError) {
                            logger.debug("Generating handler plugin on error (onError)");
                            plugin = {name: 'generatedHandlerError', fn: param.onError};
                            plugin.scope = param.scope || plugin;
                            ret.push(new HandlerErrorPlugin(plugin));
                        }
                        if (param.onProgress) {
                            logger.debug("Generating plugin on load (onLoad)");
                            plugin = {name: 'generatedOnProgress', fn: param.onProgress, type: 'progress'};
                            plugin.scope = param.scope || plugin;
                            ret.push(plugin);
                        }
                        if (param.progress) {
                            logger.debug("Generating plugin on error (onError)");
                            plugin = {name: 'generatedOnProgress', fn: param.progress, type: 'progress'};
                            plugin.scope = param.scope || plugin;
                            ret.push(plugin);
                        }
                    }
                    return ret;
                };

                /**
                 * Returns a list of the ServiceMethods provided by this Service.
                 */
                this.getMethods = function () {
                    return methodsArr;
                };

                logger.debug("Service initialized", this);
            },

            /**
             * Adds a plugin to the list of those applied with this Service.
             */
            addPlugin: function (plugin) {
                this.plugins.push(plugin);
                logger.debug(plugin.name + " has been added");
            },

            /**
             * Deletes a plugin from the Service.
             * TODO: is there a dojo convenience method for this? or an ordered hash set?
             */
            removePlugin: function (plugin) {
                var index, plug, plugs = this.plugins;
                logger.debug("Attempting to remove " + plugin.name);
                for (index = 0; index < plugs.length; index += 1) {
                    plug = plugs[index];
                    if (plug.name === plugin.name && plug.type === plugin.type) {
                        plugs.splice(index, 1);
                        logger.debug(plugin.name + " has been removed");
                        break;
                    }
                }
            },

            /**
             * Resolves any plugins to apply during service processes. As with the callbacks, they are resolved with increasing
             * granularity:
             * 1) The absolute default in the absence of any other plugins is empty arrays for each, meaning none will be executed.
             * 2) If factory plugins for the service factory were supplied, they will be used
             * 3) If service plugins were specified, they will be used.
             * 4) If plugins are supplied at method invocation time, they will be used.
             */
            resolvePlugins: function (methodName, invocationPlugins) {

                logger.debug("Resolving plugins for " + this.name + " " + methodName);
                var plugins = this.pluginMatcher.getPhaseChains(this.name, methodName, this.factoryPlugins, this.plugins, invocationPlugins);
                return plugins;
            }
        });

    return module;
});
