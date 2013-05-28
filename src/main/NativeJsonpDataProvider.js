/**
 * @class circuits.NativeJsonpDataProvider
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
             * @param url to test.
             */
            read: function (params) {
                return this.addScript(params);
            },

            create: function (params) {
                throw new Error("Can not do create via JSONP");
            },

            update: function (params) {
                throw new Error("Can not do updates via JSONP");
            },

            del: function (params) {
                throw new Error("Can not do deletes via JSONP");
            },

            /**
             * Adds script tag to header of page to make jsonp request.
             * @param id
             * @param url
             * @returns {Node}
             */
            addScript: function (params) {
                var element = document.createElement('script'),
                    callbackName = params.jsonpCallbackParam,
                    callback = params.payload.callback,
                    jsonpCallback = 'jsonp' + new Date().getTime(),
                    headElement = document.getElementsByTagName('head')[0];
                window[jsonpCallback] = function (data) {
                    callback(data);
                    delete window[jsonpCallback];
                    element = document.getElementById(jsonpCallback);
                    headElement.removeChild(element);
                };
    
                element.type = 'text/javascript';
                element.src = params.url + '&' + callbackName + '=' + jsonpCallback;
                element.id = jsonpCallback;
                element.async = true;
                element.charset = 'utf-8';

                return headElement.appendChild(element);
            }
        });
    return module;
});
