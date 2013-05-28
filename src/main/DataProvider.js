/**
 * @class circuits/DataProvider
 *
 * Interface defining basic CRUD methods for a data provider.
 * Intended to be used by stores, etc. so we can inject specific
 * providers such as Ajax, Cache, and so on.
 *
 * Each DataProvider method should return a Request instance that encapsulates the data call.
 */
define([
    "./declare"
], function (
    declare
) {
    var module = declare("DataProvider", null, {

        /**
         * Synchronous connectivity test.
         * @return boolean - whether the connection was successful.
         */
        test: function (url) {
            throw new Error("Must implement DataProvider.test()");
        },

        /**
         * Create an object. Implementation is expected to understand the passed args object
         * and store the data item as appropriate for its implementation (e.g., POST).
         */
        create: function (params) {
            throw new Error("Must implement DataProvider.create()");
        },

        /**
         * Get an object. Implementation is expected to understand the passed args object
         * and retrieve a data item as appropriate for its implementation (e.g., GET).
         */
        read: function (params) {
            throw new Error("Must implement DataProvider.read()");
        },

        /**
         * Update an object. Implementation is expected to understand the passed args object
         * and update the data item as appropriate for its implementation (e.g., PUT).
         */
        update: function (params) {
            throw new Error("Must implement DataProvider.update()");
        },

        /**
         * Delete an object. Implementation is expected to understand the passed args object
         * and remove the item as appropriate for its implementation (e.g., DELETE).
         * Shortened the name to prevent having to quote "delete" when accessing.
         */
        del: function (params) {
            throw new Error("Must implement DataProvider.del()");
        },

        /**
         * Map of protocol methods to data provider methods.
         */
        httpMethodMap: {
            'GET': {method: 'read', hasPayload: false},
            'POST': {method: 'create', hasPayload: true},
            'PUT': {method: 'update', hasPayload: true},
            'DELETE': {method: 'del', hasPayload: false},
            'JSONP': {method: 'read', hasPayload: false}
        }
    });

    return module;
});
