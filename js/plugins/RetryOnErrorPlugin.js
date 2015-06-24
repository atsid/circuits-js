/**
 * Handler Plugin that retries a service call a configured number of times
 * before calling a configured error method.
 * config: {
     *  retry: [number] - number of retries to attempt before calling error callback
     *  callback: [function] - error handler to execute after x retries
     *  scope: [object] - scope object to execute error callback in
     * }
 */
define([
    "../declare",
    "./HandlerErrorPlugin"
], function (
    declare,
    HandlerErrorPlugin
) {
    var module = declare([HandlerErrorPlugin], {

        constructor: function (config) {

            var that = this, retryCount = 0;

            this.fn = function (data, params) {

                if (retryCount < that.retry) {
                    retryCount += 1;
                    params.request.execute();
                } else {
                    retryCount = 0;
                    that.callback.call(that.scope || that.callback, data, params);
                }

            };

        }
    });

    return module;
});
