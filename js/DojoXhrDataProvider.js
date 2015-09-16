"use strict";
/**
 * @class circuits/DojoXhrDataProvider
 *
 * Data provider implementation that delegates directly to dojo.xhr() methods.
 */
define([
    "dojo",
    "./declare",
    "./log",
    "./DataProvider",
    "./Request"
], function (
    dojo,
    declare,
    logger,
    DataProvider,
    Request
) {
    var module = declare(DataProvider, {
            test: function (url) {
                var ret = true, xhr;
                try {
                    // try the lowest footprint synchronous request to specific url.
                    xhr = new XMLHttpRequest();
                    xhr.open("HEAD", url, false);
                    xhr.send();
                } catch (e) {
                    ret = false;
                }
                return ret;
            },

            create: function (params) {

                var payload = dojo.toJson(params.payload),
                    request = new Request({
                        url: params.url,
                        handleAs: params.handleAs || "json",
                        headers: params.headers || { "Content-Type": "application/json"},
                        postData: payload,
                        load: params.load || this.defaultLoad,
                        error: params.error || this.defaultError
                    }, dojo.xhrPost);

                logger.debug("Xhr-based store executing POST to " + params.url, payload);

                if (!params.dontExecute) {
                    request.execute();
                }
                return request;

            },

            read: function (params) {

                var request = new Request({
                    url: params.url,
                    handleAs: params.handleAs || "json", //great spot to inject a pre-process handler
                    load: params.load || this.defaultLoad,
                    error: params.error || this.defaultError
                }, dojo.xhrGet);

                logger.debug("Xhr-based store executing GET to " + params.url);

                if (!params.dontExecute) {
                    request.execute();
                }
                return request;

            },

            update: function (params) {

                var payload = dojo.toJson(params.payload),
                    request = new Request({
                        url: params.url,
                        handleAs: params.handleAs || "json",
                        headers: params.headers || { "Content-Type": "application/json"},
                        putData: payload,
                        load: params.load || this.defaultLoad,
                        error: params.error || this.defaultError
                    }, dojo.xhrPut);

                logger.debug("Xhr-based store executing PUT to " + params.url, payload);

                if (!params.dontExecute) {
                    request.execute();
                }
                return request;

            },

            del: function (params) {

                var request = new Request({
                    url: params.url,
                    load: params.load || this.defaultLoad,
                    error: params.error || this.defaultError
                }, dojo.xhrDelete);

                logger.debug("Xhr-based store executing DELETE to " + params.url);

                if (!params.dontExecute) {
                    request.execute();
                }
                return request;

            },

            defaultLoad: function (data, ioArgs) {
                logger.warn("No load handler specified for XHR call to " + ioArgs.url);
            },

            defaultError: function (data, ioArgs) {
                logger.warn("No error handler specified for XHR call to " + ioArgs.url);
                logger.error(data);
            }
        });
    return module;
});