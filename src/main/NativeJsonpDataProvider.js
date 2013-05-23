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
             * @param url to test.
             */
            test: function (url) {

            },

            create: function (params) {

                logger.error("JSONP requests can not execute create method");

            },

            attach: function (id, url) {
                var doc =  Document,
                    element = doc.createElement('script');

                element.type = 'text/javascript';
                element.src = url;
                element.id = id;
                element.async = true;
                element.charset = 'utf-8';

                return doc.getElementsByTagName('head')[0].appendChild(element);
            }

        });
    return module;
});
