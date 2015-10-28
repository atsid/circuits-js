"use strict";
/**
 * A Data provider that attempts to compensate for temporary
 */
define([
    "./declare",
    "./util",
    "./WebStorage",
    "./DataProvider",
    "./Request"
], function (
    declare,
    Util,
    WebStorage,
    DataProvider,
    Request
) {

    var util = new Util(),
        module = declare("OfflineTolerantProvider", DataProvider, {
            constructor: function (delegate) {

                var storage = new WebStorage(),
                    cacheId = "circuits.retrycache",

                // private methods
                // add a request to the local storage cache.
                    addToCache = function (params) {
                        var cache = storage.getLocalObject(cacheId);
                        cache = cache || {};
                        cache[params.url] = params;
                        storage.setLocalObject(cacheId, cache);
                    },
                // remove cached item.
                    removeFromCache = function (request, params) {
                        var cache = storage.getLocalObject(cacheId);
                        cache = cache || {};
                        delete cache[params.url];
                        storage.setLocalObject(cacheId, cache);
                    },
                // retry cache if there is one
                    retryCache = function () {
                        var ret = true,
                            cache = storage.getLocalObject(cacheId) || {},
                            cacheKeys = Object.keys(cache);
                        if (cacheKeys.length > 0) {
                            ret = delegate.test(cache[cacheKeys[0]]);
                        }
                        if (ret) {
                            Object.keys(cacheKeys).forEach(function (item, idx) {
                                var req,
                                    storedParams = util.mixin({
                                        load: function (data, params, total) {
                                            removeFromCache(params);
                                        },
                                        error: function (data, ioArgs) {
                                            // leave in cache.
                                        }
                                    }, cache[item]),
                                    method = delegate[cache[item].methodName];
                                req = method.call(delegate, cache[item]);
                                req.execute();
                            });
                        }
                        return ret;
                    },
                // handle a request and cache/retry if necessary.
                    handleCacheAndProcess = function (method, params) {
                        var proceed = retryCache(),
                            tmp = util.mixin({}, params),
                            paramsCopy = util.mixin(tmp, {
                                dontExecute: true,
                                methodName: method,
                                load: function (data, ioArgs) {
                                    if (ioArgs && ioArgs.xhr && ioArgs.xhr.status === 0) {
                                        ioArgs.load.call(ioArgs.scope, params.payload, params);
                                    } else {
                                        ioArgs.load.call(ioArgs.scope, data, ioArgs);
                                    }
                                },
                                error: function (data, ioArgs) {
                                    addToCache(paramsCopy);
                                    params.load.call(params.scope || this, params.payload || params, params);
                                }
                            }),
                            ret = delegate[method](paramsCopy);
                        if (proceed) {
                            ret.execute();
                        } else {
                            addToCache(paramsCopy);
                        }
                        return ret;
                    };

                this.create = function (params) {
                    return delegate.create(params);
                };

                this.read = function (params) {
                    return delegate.read(params);
                };

                /**
                 * Perform an update on a resource caching the call if offline.
                 * @return the request that was executed.
                 */
                this.update = function (params) {
                    handleCacheAndProcess("update", params);
                };

                /**
                 * Perform a delete against a resource caching the call if offline.
                 * @return the request that was executed.
                 */
                this.del = function (params) {
                    handleCacheAndProcess("del", params);
                };

                /**
                 * Synchronous connectivity test.
                 * @return boolean - whether the connection was successful.
                 */
                this.test = function (url) {
                    return delegate.test(url);
                };

            }
        });
    return module;
});