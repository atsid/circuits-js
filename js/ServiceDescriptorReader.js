"use strict";
/**
 * Interface defining the operations needed by consumers of ServiceDescriptorReaders
 */
define([
    "./declare"
], function (
    declare
) {
    var module = declare(null, {
        /**
         * Returns the identifier of the schema this reader operates on.
         */
        getSchemaId: function () {
            throw new Error("Not Implemented");
        },

        /**
         * Gets the root target property for the service.
         */
        getRootPath: function () {
            throw new Error("Not Implemented");
        },

        /**
         * Gets a list of the service method names defined by the SMD.
         */
        getMethodNames: function () {
            throw new Error("Not Implemented");
        },

        /**
         * Gets list of service methods in the SMD. These are the actual schema objects.
         */
        getMethods: function () {
            throw new Error("Not Implemented");
        },

        /**
         * Gets a specific service method object by name.
         */
        getMethod: function (methodName) {
            throw new Error("Not Implemented");
        },

        /**
         * Gets a list of parameter names for a specified service.
         */
        getParameterNames: function (methodName) {
            throw new Error("Not Implemented");
        },

        /**
         * Gets a list of parameters for a specified service. These are the actual objects.
         */
        getParameters: function (methodName) {
            throw new Error("Not Implemented");
        },

        /**
         * Indicates whether the specified argument on a service method is required or not.
         */
        isArgumentRequired: function (methodName, argName) {
            throw new Error("Not Implemented");
        },

        /**
         * For the specified service, map the args object to the target + parameters to
         * get a full, functional URL.
         */
        getServiceUrl: function (methodName, args) {
            throw new Error("Not Implemented");
        },

        getMethodTransport: function (methodName) {
            throw new Error("Not Implemented");
        },

        getAndValidateArgument: function (param, args) {
            throw new Error("Not Implemented");
        },

        replacePathParamsInUrl: function (url, params, args) {
            throw new Error("Not Implemented");
        },

        addQueryParamsToUrl: function (url, params, args) {
            throw new Error("Not Implemented");
        },

        /**
         * Returns the param list mapped by envelope (URL, PATH, ENTITY)
         */
        enumerateParameters: function (service) {
            throw new Error("Not Implemented");
        },

        getResponseSchema: function (methodName) {
            throw new Error("Not Implemented");
        }

    });
    return module;
});