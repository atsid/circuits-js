/**
 * @class ./ServiceQueue
 *
 * This class exposes functionality to control a collection of service calls.
 *
 */
define([
    "./Logger",
    "./util",
    "./declare"
], function (
    Logger,
    Util,
    declare
) {
    var logger = new Logger("debug"),
        util = new Util(),
        module = declare(null, {

        /**
         * @constructor
         * The config object is of the form:
         * {
         *    autoRefreshInterval
         * }
         */
        constructor: function (config) {
            var calls = [], executed = false,
                requests = [];

            this.autoRefreshInterval = config.autoRefreshInterval || 0;
            /**
             * Clear the queue.
             */
            this.clear = function () {
                calls = [];
                requests = [];
                executed = false;
                if (this.lastTimer) {
                    clearTimeout(this.lastTimer);
                }
            };

            /**
             * Reset the queue to be executed again with the current calls.
             */
            this.reset = function () {
                var saveCalls = calls;
                this.clear();
                calls = saveCalls;
            };

            /**
             * Has execute been called on the queue?
             */
            this.hasBeenExecuted = function () {
                return this.executed;
            };

            /**
             * Has the current execution finished?
             */
            this.executionComplete = function () {
                return calls.length === requests.length;
            };

            /**
             * Add a service call to the queue.
             * @param serviceCall - the method on the service to call,
             *      a function on the service created by a service factory.
             * @param params - the parameters normally passed as the first
             *      arg to the service call.
             * @param callbacks - the callbacks or plugin array normally passed as the second
             *      argument to the service call.
             */
            this.add = function (serviceCall, params, callbacks) {
                calls.push({'fn': serviceCall, 'params': params, 'callbacks': callbacks});
            };

            /**
             * Does the queue have errors?
             */
            this.hasErrors = function () {
                var ret = false;
                requests.forEach(function (item, idx) {
                    if (item.inError) {
                        ret = true;
                    }
                }, this);
                return ret;
            };

            /**
             * Return the array of requests for executed calls.
             */
            this.getCompletedRequests = function () {
                var ret = [].concat(requests);
                return ret;
            };

            /**
             * Is this queue empty?
             */
            this.isEmpty = function () {
                return (calls.length === 0);
            };

            /**
             * Execute the collection of service calls in parallel, calling the passed
             * callback when the load for each service has been invoked.
             *
             * @param callback - a function accepting one argument, this queue.
             * @param scope - the scope to call the callback in if any.
             */
            this.execute = function (callback, scope) {
                var that = this;

                if (this.hasBeenExecuted()) {
                    if (!this.executionComplete()) {
                        throw new Error("Attempt to re-execute an in-progress queue.");
                    } else {
                        this.reset();
                    }
                }

                this.executed = true;

                calls.forEach(function (item, idx) {
                    var callbacks = util.mixin({}, item.callbacks),
                        currentLoad = callbacks.load;

                    callbacks.load = function (data, params, count) {
                        requests.push(params.request);
                        currentLoad.call(item.callbacks.scope, data, params, count);
                        if (calls.length === requests.length) {
                            if (scope) {
                                callback.call(scope, that);
                            } else {
                                callback(that);
                            }
                            if (that.autoRefreshInterval) {
                                that.lastTimer = setTimeout(function () {
                                    that.execute(callback, scope);
                                }, that.autoRefreshInterval);
                            }
                        }
                    };

                    item.fn.call(callbacks.scope, item.params, callbacks);
                }, this);

                if (this.isEmpty()) {
                    if (scope) {
                        callback.call(scope, that);
                    } else {
                        callback(that);
                    }
                }

            };

        }

    });
    return module;
});
