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
             * @param {object} params
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
             * @param {string} transport
             * @return {boolean} 
             * @overrides
             */
            supportsTransport: function (transport) {
                return transport === 'JSONP';
            },

            /**
             * Adds script tag to header of page to make jsonp request.
             * @param {object} params 
             * @returns {Node}
             */
            addScript: function (params) {
                var element = document.createElement('script'),
                    callbackName = params.jsonpCallbackParam,
                    callback = params.payload.callback,
                    jsonpCallback = 'jsonp' + new Date().getTime(),
                    jsonpUrl = callbackName + '=' + jsonpCallback,
                    headElement = document.getElementsByTagName('head')[0];
                    
                window[jsonpCallback] = function (data) {
                    callback(data);
                    delete window[jsonpCallback];
                    headElement.removeChild(element);
                };
    
                element.type = 'text/javascript';
                element.src = this.updateQueryString(params.url, callbackName, jsonpCallback);
                element.id = jsonpCallback;
                element.async = true;
                element.charset = 'utf-8';

                return headElement.appendChild(element);
            },
            
            /**
             * Appends the callback paramater to the existing url
             * @param {string} url
             * @param {string} key
             * @param {string} value
             * @returns {string}
             */
            updateQueryString: function (url, key, value) {
                var regex = new RegExp("([?|&])" + key + "=.*?(&|#|$)(.*)", "gi"),
                    separator, 
                    hash;
                    
                if (regex.test(url)) {
                    url = url.replace(regex, '$1' + key + "=" + value + '$2$3');
                } else {
                    separator = url.indexOf('?') !== -1 ? '&' : '?',
                    hash = url.split('#');
                    url = hash[0] + separator + key + '=' + value;
                }
                return url;
            }
        });
    return module;
});
