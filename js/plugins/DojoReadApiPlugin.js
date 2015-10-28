"use strict";
/**
 * Mixin plugin that adds a getValue method to a service instance, emulating the getValue functionality
 * of the dojo Read API.
 *
 *         identityAttributes: "id"
 *         methodName: "queryOfficeActionsOnly"
 */
define([
    "../util",
    "../log",
    "../Plugin",
    "../declare"
], function (
    Util,
    logger,
    Plugin,
    declare
) {

        var util = new Util(),
            module = declare(Plugin, {
                constructor: function () {
                    this.type = "mixin";

                    this.fn = function (service) {
                        service.methodName = this.methodName;
                        service.methodArgs = this.methodArgs;
                        service.identityAttributes = this.identityAttributes;

                        service.getValue = function (item, valueName, defaultValue) {
                            var value = item[valueName];
                            if (typeof(value) === 'undefined') {
                                value = defaultValue;
                            }
                            return value;
                        };

                        service.getValues = function (item, valueName) {
                            var retVal;
                            if (!service.hasAttribute(item, valueName)) {
                                retVal = [];
                            } else {
                                retVal = item[valueName];
                            }
                            return retVal;
                        };

                        service.getAttributes = function (item) {
                            return Object.keys(item);
                        };

                        service.hasAttribute = function (item, attrib) {
                            return typeof(item[attrib]) !== 'undefined';
                        };

                        service.containsValue = function (item, attribute, value) {
                            return (this.getValue(item, attribute) === value);
                        };

                        service.isItem = function (item) {
                            logger.warn("isItem no-op");
                            return true;
                        };

                        service.isItemLoaded = function (item) {
                            logger.warn("isItem no-op");
                            return this.isItem(item); //boolean
                        };

                        service.loadItem = function (keywordArgs) {
                            //TODO: should we keep this a no-op?
                            logger.warn("loadItem no-op");
                        };


                        if (typeof (this.methodName) === "function") {
                            service.fetch = this.methodName;
                        } else {
                            service.fetch = function (args) {
                                var methodName = this.methodName,
                                    methodArgs = {};

                                this.methodArgs.forEach(function (arg) {
                                    methodArgs[arg] = this[arg];
                                }, this);

                                // if there is an onBegin function passed to the
                                // fetch, then call it as part of the passed onComplete.
                                // todo: implement all possible fetch args.
                                if (args.onComplete) {
                                    args.load = function (data, params, total) {
                                        if (args.onBegin) {
                                            args.onBegin(total);
                                        }
                                        return args.onComplete(data, params, total);
                                    };
                                }

                                util.mixin(args, methodArgs);
                                return this[methodName].call(args.scope || this, args, args);
                            };
                        }
                        service.getFeatures = function () {
                            return {'dojo.data.api.Read': true,
                                'dojo.data.api.Identity': true};
                        };

                        service.getLabel = function (item) {
                            if (this.isItem(item)) {
                                return this.getValue(item, 'label');
                            }
                            return undefined;
                        };

                        service.getLabelAttributes = function (item) {
                            return ['label'];
                        };

                        service.close = function (request) {
                            return undefined;
                        };

                        // ************* Identity API  *************************************//
                        service.getIdentity = function (item) {
                            return item[this.getIdentityAttributes()];
                        };

                        service.getIdentityAttributes = function (item) {
                            var retVal;
                            if (typeof (this.identityAttributes) === 'undefined') {
                                retVal = "id";
                            } else {
                                retVal = this.identityAttributes;
                            }
                            return retVal;
                        };

                        service.fetchItemByIdentity = function (args) {
                            logger.warn("fetchItemByIdentity no-op: " + args);
                        };
                    };
                }
            });

        return module;
});
