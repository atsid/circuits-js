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
        
            constructor: function (config) {
                var that = this;
                
                this.hitchedInvoke = function () {
                    that.invokeJsonpRequest.apply(that, arguments);
                };
            },

            /**
             * @param {object} params
             * @return {object} request
             */
            read: function (params) {
                var jsonpCallback = 'jsonp' + new Date().getTime(),
                request = new Request({
                    callbackName: params.jsonpCallbackParam,
                    callback: params.payload.callback,
                    jsonpCallback: jsonpCallback,
                    jsonpUrl: params.url
                }, this.hitchedInvoke);
            
                return request;
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
             * Adds script tag to header of page to make jsonp request and invokes the callback.
             * @param {object} params 
             * @returns {Node}
             */
            invokeJsonpRequest: function (params) {
                var element = document.createElement('script'),
                    headElement = document.getElementsByTagName('head')[0],
                    callback = params.callback,
                    jsonpCallback = params.jsonpCallback;

                    
                window[jsonpCallback] = function (data) {
                    callback(data);
                    delete window[jsonpCallback];
                    headElement.removeChild(element);
                };
    
                element.type = 'text/javascript';
                element.src = this.updateQueryString(params.jsonpUrl, params.callbackName, jsonpCallback);
                element.id = jsonpCallback;
                element.async = true;
                element.charset = 'utf-8';

                headElement.appendChild(element);
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
