/**
 * A PluginMatcher is used to match plugins based on the service and method name (using "regex-style" match),
 * and sort them according to type.
 */
define([
    "./declare",
    "./util",
    "./log"
], function (
    declare,
    Util,
    logger
) {

    var util = new Util(),
        module = declare(null, {

        constructor: function () {
            this.defaults = {
                read: [],
                write: [],
                url: [],
                request: [],
                response: [],
                mixin: [],
                provider: [],
                progress: [],
                handler: []
            };
        },

        /**
         * Returns a boolean indicating whether the passed in plugin or pointcut matches the given name. If a string is passed
         * as the second arg it is assumed to be a pointcut. If a plugin object is passed, it is checked for either a
         * pointcut or a pattern attribute. In either case the method delegates to the matchPointcut or matchPattern method.
         *
         * @param name - service and method name in dot notation, like "CaseService.readCase".
         * @param pointcutOrPlugin - pointcut string or plugin for matching against name.
         */
        match: function (name, pointcutOrPlugin) {
            var method, matchstr;

            matchstr = (pointcutOrPlugin && (pointcutOrPlugin.pointcut || pointcutOrPlugin.pattern)) || pointcutOrPlugin;

            if ((pointcutOrPlugin && pointcutOrPlugin.pointcut) || typeof (pointcutOrPlugin) === 'string') {
                method = this.matchPointcut;
            } else {
                method = this.matchPattern;
            }
            return method(name, matchstr);
        },

        /**
         * Returns a boolean indicating whether the passed in plugin's pointcut matches the service and method names provided.
         *
         * @param name - service and method name in dot notation, like "CaseService.readCase".
         * @param pointcut - poincut string for matching against names. The pointcut format is "regex-like",
         * using basic wildcard syntax like common AOP systems. A RegExp is used to match, so normal JS regex symbols can be used, with the following constraints:
         * 1) For simplicity, '*' is automatically replaced with '.*'
         * 2) It is assumed that the pointcut is word-bounded on either side, so developers don't have to worry about grabbing extra characters
         * 3) if the pointcut sent in is null/undefined, it defaults to '*.*'
         * If "name" contains a wildcard on the method side of the dot notation (e.g. "CaseService.*") then only the first service part of the name is matched
         * against the service part of the pointcut.
         */
        matchPointcut: function (name, pointcut) {
            var regexString,
                regex,
                ret;

            pointcut = pointcut || "*.*";

            regexString = pointcut.replace(/\./g, "\\.").replace(/\*/g, ".*");

            logger.debug("pointcut is: " + pointcut);

            //adds word boundaries at either the beginning, end, or both depending on the index of "*" (if any)
            //If "*" is not in the string then word boundaries should be added by default
            if (pointcut.indexOf("*") !== 0) {
                regexString = "\\b" + regexString;
            }
            if (pointcut.lastIndexOf("*") !== pointcut.length - 1) {
                regexString += "\\b";
            }
            logger.debug("regexString is: " + regexString);

            regex = new RegExp(regexString);

            logger.debug("PluginMatcher match testing [" + name + "] against regex [" + regexString + "]");
            ret = regex.exec(name);

            return ret !== null;

        },

        /**
         * Allows unencumbered regex pattern matching on the name/service string.
         *
         * @param name - service and method name in dot notation, like "CaseService.readCase".
         * @param pattern - the regular expression to match.
         */
        matchPattern: function (name, pattern) {

            var regex,
                ret;

            pattern = pattern || ".*";

            regex = new RegExp(pattern);

            logger.debug("PluginMatcher matchPattern testing [" + name + "] against regex [" + pattern + "]");

            ret = regex.exec(name);

            return ret !== null;

        },

        /**
         * Returns just the plugins from the given array with pointcuts that match the
         * service/method and passed type.
         *
         * @param serviceName - the name of the service to match against.
         * @param methodName - the name of the method on the service to match against.
         * @param type - the type of plugin to match.
         * @param plugins - the array of plugins to use as the domain.
         */
        list: function (serviceName, methodName, type, plugins) {

            var fullName = serviceName + "." + methodName,
                newPlugins = [];

            if (plugins && plugins.length > 0) {
                plugins.forEach(function (plugin) {
                    var match = this.match(fullName, plugin);
                    logger.debug("match for " + plugin.name + ": " + match);
                    if (match && plugin.type === type) {
                        logger.debug("adding " + plugin.name + " to list");
                        newPlugins.push(plugin);
                    } else {
                        logger.debug("not adding " + plugin.name + " to list");
                    }
                }, this);
            }

            return newPlugins;

        },

        /**
         * Returns just the plugins from the given array with pointcuts that match the
         * any method on a service.
         *
         * @param serviceName - the name of the service to match against.
         * @param methodNames - the names of all methods on this service.
         * @param type - the type of plugin to match.
         * @param plugins - the array of plugins to use as the domain.
         */
        listForServiceOnly: function (serviceName, methodNames, type, plugins) {

            var newPlugins = [];

            if (plugins && plugins.length > 0) {
                plugins.forEach(function (plugin) {
                    var match = this.matchingMethodNames(serviceName, methodNames, plugin);
                    if (match.length && plugin.type === type) {
                        logger.debug("adding " + plugin.name + " to service only list");
                        newPlugins.push(plugin);
                    } else {
                        logger.debug("not adding " + plugin.name + " to service only list");
                    }
                }, this);
            }

            return newPlugins;

        },

        /**
         * Returns the method names from the passed array that match the given
         * pointCut.
         *
         * @param serviceName - the name of the service to match against.
         * @param methodNames - array of names to match against.
         * @param pointCut = the pointcut to match.
         */
        matchingMethodNames: function (serviceName, methodNames, pointCut) {
            var fullName, ret = [];

            methodNames.forEach(function (name) {
                fullName = serviceName + "." + name;
                var match = this.match(fullName, pointCut);
                if (match) {
                    ret.push(name);
                }
            }, this);

            return ret;
        },

        /**
         * Construct an object containing the arrays of plugins for each phase with precedence and
         * execution order resolved.
         *
         * @param {String} serviceName the name of the service to match against.
         * @param {String} methodName - the name of the method on the service to match against.
         * @param {Array of circuits.Plugin} factoryPlugins the array of plugins at the factory level.
         * @param {Array of circuits.Plugin} servicePlugins the array of plugins at the service level.
         * @param {Array of circuits.Plugin} invokePlugins the array of plugins at the method invocation level.
         *
         * @return {Object} an object containing an array of plugins for each phase of the service request.
         */
        getPhaseChains: function (serviceName, methodName, factoryPlugins, servicePlugins, invokePlugins) {

            var ret = util.mixin({}, this.defaults), that = this;

            Object.keys(ret).forEach(function (key) {
                var pf = that.list(serviceName, methodName, key, factoryPlugins),
                    ps = that.list(serviceName, methodName, key, servicePlugins),
                    pi = that.list(serviceName, methodName, key, invokePlugins);
                ret[key] = [].concat((pf || []), (ps || []), (pi || []));
            });

            return ret;
        }
    });

    return module;

});