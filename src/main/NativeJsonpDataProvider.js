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
                this.call
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
                return this.addScript(params.id, params.url);
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
            addScript: function (id, url) {
                var element = document.createElement('script');

                element.type = 'text/javascript';
                element.src = url;
                element.id = id;
                element.async = true;
                element.charset = 'utf-8';

                return document.getElementsByTagName('head')[0].appendChild(element);
            },

            callback: function(processResults) {


            }



        });
    return module;
});
