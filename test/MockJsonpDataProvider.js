/**
 * @class MockJsonpDataProvider
 *
 * @inherits circuits/NativeJsonpDataProvider
 * 
 * This class inherits from the NativeJsonpDataProvider for the sole reason
 * of overriding that classes invoke method, thereby providing the ability to 
 * test JSONP requests against the local file system.
 */
define([
    "circuits/declare",
    "circuits/NativeJsonpDataProvider"
], function (
    declare,
    NativeJsonpDataProvider
) {
    var module = declare(NativeJsonpDataProvider, {
        /**
         * Adds script tag to header of page to make jsonp request and invokes the callback.
         * @param {object} params 
         * @returns {Node}
         *
         * This implementation is intended to be identical to the one in the 
         * circuits/NativeJsonpDataProvider class with the exception that it 
         * does not append the standard JSONP callback parameters to the query string,
         * thereby allowing the testing of a JSONP request against the local file system.
         */
        invokeJsonpRequest: function (params) {
            var element = document.createElement('script'),
                headElement = document.getElementsByTagName('head')[0],
                load = params.load,
                error = params.error,
                jsonpCallback = 'callback', //hard coded for mock
                timeout = params.timeout || 10000,
                timeoutId,
                handleError = function (err) {
                    window.clearTimeout(timeoutId);
                    delete window[jsonpCallback];
                    headElement.removeChild(element);
                    if (error) {
                        error("500", {message: err});
                    }
                };

                
            window[jsonpCallback] = function (data) {
                window.clearTimeout(timeoutId);
                // TODO: add response validation here
                load("200", data);
                delete window[jsonpCallback];
                headElement.removeChild(element);
            };
            
            // Error handlers fall back to timeout. 
            element.onerror = handleError;
            element.onreadystatechange = function () {
                var readyState = element.readyState;
                if (readyState !== 'loaded') {
                    handleError({type: 'error'});
                }
            };
            timeoutId = window.setTimeout(handleError, timeout, 'timeout');

            element.type = 'text/javascript';
            element.src = this.updateQueryString(params.jsonpUrl, params.callbackName, jsonpCallback);
            element.id = jsonpCallback;
            element.async = true;
            element.charset = 'utf-8';

            headElement.appendChild(element);
        }
    });
    return module;
});
