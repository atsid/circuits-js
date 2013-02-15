define([
    "./declare",
    "./util",
    "./Logger"
], function (
    declare,
    Util,
    Logger
) {

    var requestId = 0,
        util = new Util(),
        logger = new Logger("debug"),
        module = declare("Request", null, {
            /**
             * @constructor
             * @param params - the data call params to send to the data function (e.g., the args to a dojo xhrGet)
             * @param fn - the data function to execute (e.g., dojo.xhrGet)
             */
            constructor: function (params, fn) {
                this.params = params;
                this.fn = fn;
                this.id = (requestId += 1);
                this.pending = false;
                this.complete = false;
                this.canceled = false;
                this.inError = false;
            },

            /**
             * Mark this request as cancelled, which will avoid calling handlers if they
             * haven't been called.
             */
            cancel: function () {
                logger.debug("Canceling request: " + this.id);
                this.pending = false;
                this.canceled = true;
            },

            /**
             * Calls the specified data function, passing in the params.
             * This allows us to wrap these calls with a cancellation check.
             * Note that scope is ignored - the ultimate callback scope is defined wherever the provider method is ultimately called.
             */
            execute: function () {

                var that = this,
                    paramHandler = this.params.handler,
                    params = util.mixin({}, this.params);

                //wrap the handler callbacks in a cancel check
                function handler(responseCode, data, ioArgs) {
                    that.xhr = ioArgs.xhr;
                    that.statusCode = that.xhr && that.xhr.status;
                    if (that.canceled) {
                        logger.debug("Request [" + that.id + "] was canceled, not calling handler");
                    } else {
                        that.pending = false;
                        that.complete = true;
                        paramHandler(responseCode, data, ioArgs);
                    }
                }

                if (this.cancelled) {
                    logger.debug("Request [" + that.id + "] was canceled, not executing");
                } else {
                    this.pending = true;
                    this.fn(util.mixin(params, {
                        handler: handler
                    }));
                }
            }
        });

    return module;
});
