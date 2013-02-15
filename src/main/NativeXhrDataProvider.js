/**
 * @class circuits.NativeXhrDataProvider
 *
 * Data provider implementation that wraps the native XmlHttpRequest.
 */
define([
    "./declare",
    "./DataProvider",
    "./Request",
    "./Logger"
], function (
    declare,
    DataProvider,
    Request,
    Logger
) {
    var logger = new Logger("debug"),
        module = declare(DataProvider, {

        /**
         * @constructor - warn on level compliance
         */
        constructor: function (config) {
            var test = new XMLHttpRequest(), that = this;
            if (!test.upload) {
                logger.warn("NativeXhrDataProvider: This runtime is not XHR level 2 compliant.");
            }
            this.asynchronous = (config && typeof (config.asynchronous) === 'boolean')
                ? config.asynchronous : true;
            this.hitchedInvoke = function () {
                that.invokeXhrSend.apply(that, arguments);
            };
        },

        /**
         * test - do a network test with a synchronous call.
         * @param - url to test.
         */
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
            var payload = params.payload,
                request,
                contentType = params.headers && params.headers["Content-Type"];

            contentType = contentType || "application/json";

            if (contentType === "application/json") {
                payload = JSON.stringify(params.payload);
            }

            request = new Request({
                url: params.url,
                method: "POST",
                headers: params.headers || { "Content-Type": contentType},
                payload: payload,
                asynchronous: params.asynchronous,
                responseType: params.responseType || "json",
                onprogress: params.onprogress || this.defaultOnProgress,
                handler: params.handler || this.defaultHandler
            }, this.hitchedInvoke);

            logger.debug("Xhr-based store executing POST to " + params.url, payload);

            if (!params.dontExecute) {
                request.execute();
            }
            return request;
        },

        read: function (params) {

            var request = new Request({
                url: params.url,
                method: "GET",
                asynchronous: params.asynchronous,
                handler: params.handler || this.defaultHandler,
                responseType: params.responseType || "json"
            }, this.hitchedInvoke);

            logger.debug("Xhr-based store executing GET to " + params.url);

            if (!params.dontExecute) {
                request.execute();
            }
            return request;

        },

        update: function (params) {
            var payload = params.payload,
                request,
                contentType = params.headers && params.headers["Content-Type"];

            contentType = contentType || "application/json";

            if (contentType === "application/json") {
                payload = JSON.stringify(params.payload);
            }

            request = new Request({
                url: params.url,
                method: "PUT",
                asynchronous: params.asynchronous,
                headers: params.headers || { "Content-Type": contentType},
                payload: payload,
                responseType: params.responseType || "json",
                handler: params.handler || this.defaultHandler
            }, this.hitchedInvoke);

            logger.debug("Xhr-based store executing PUT to " + params.url, payload);

            if (!params.dontExecute) {
                request.execute();
            }
            return request;
        },

        del: function (params) {
            var request = new Request({
                url: params.url,
                asynchronous: params.asynchronous,
                method: "DELETE",
                handler: params.handler || this.defaultHandler,
                responseType: params.responseType || "json"
            }, this.hitchedInvoke);

            logger.debug("Xhr-based store executing DELETE to " + params.url);

            if (!params.dontExecute) {
                request.execute();
            }
            return request;

        },

        /**
         * Perform the actual XMLHttpRequest call, interpreting the params as necessary.
         * Although this method accepts the bulk of the parameters that can be set on XMLHttpRequest 2,
         * only a few are passed through from the upstream calls.
         *
         * @param params - object of the form:
         * {
         *   onprogress {function}
         *   onloadstart {function}
         *   onabort {function}
         *   ontimeout {function}
         *   onloadend {function}
         *   onreadystatechange {function}
         *   asynchronous {boolean}
         *   method {String}
         *   headers {Object}
         *   payload {Object}
         *   url {String}
         *   timeout {Number}
         *   responseType {String}
         *   handler {function}
         * }
         */
        invokeXhrSend: function (params) {
            var xhr = new XMLHttpRequest(),
                async = typeof (params.asynchronous) === "boolean"
                    ? params.asynchronous : this.asynchronous,

                readystatechange = function () {
                    var resp = this.response || this.responseText;
                    if (params.onreadystatechange) {
                        params.onreadystatechange.call(this);
                    } else {
                        if (this.readyState === this.DONE) {
                            if (!this.loadcalled) { // prevent multiple done calls from xhr.

                                this.loadcalled = true;
                                if (resp && !this.responseType &&
                                        params.responseType === "json") {
                                    try {
                                        resp = JSON.parse(resp);
                                    } catch (e) {
                                        logger.debug('Unable to parse JSON: ' + resp + '\n' + e);
                                    }
                                }

                                params.handler.call(this, this.status, resp, params);
                            }
                        }
                    }
                };

            // setup pre-open parameters
            params.xhr = xhr;
            if (params.timeout && typeof (xhr.timeout) === 'number') {
                xhr.timeout = params.timeout;
            }

            if (params.responseType && typeof (xhr.responseType) === 'string') {
                // types for level 2 are still draft. Don't attempt to set until
                // support is more universal.
                //
                // xhr.responseType = params.responseType;
                logger.debug("Ignoring responseType on XHR until fully supported.");
            }

            xhr.open(params.method, params.url, async);
            Object.keys((params.headers || {})).forEach(function (val, idx, obj) {
                if (!(val === "Content-Type" && params.headers[val] === "multipart/form-data")) {
                    xhr.setRequestHeader(val, params.headers[val]);
                }
            });

            // If level 2, then attach the handlers directly.
            if (xhr.upload) {
                Object.keys(params).forEach(function (key, idx, obj) {
                    if (key.indexOf("on") === 0 && typeof (params[key]) === 'function') {
                        if (typeof (xhr[key]) !== 'undefined') {
                            xhr[key] = params[key];
                        }
                        if (typeof (xhr.upload[key]) !== 'undefined') {
                            xhr.upload[key] = params[key];
                        }
                    }
                });
            }
            // still support readystate event.
            if (params.handler || params.onreadystatechange) {
                xhr.onreadystatechange = readystatechange;
            }

            xhr.send(params.payload);
        },

        defaultHandler: function (data, ioArgs) {
            logger.debug("No handler specified for XHR call to " + ioArgs.url);
        },

        defaultProgress: function (data, ioArgs) {
            logger.debug("No handler specified for XHR call to " + ioArgs.url);
        },

        defaultOnProgress: function (event) {
            logger.warn("No progress handler specified for XHR call to " + event);
        }

    });

    return module;
});
