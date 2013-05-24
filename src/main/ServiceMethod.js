/**
 * @class circuits.ServiceMethod
 * A wrapper class for service method invocations. An instance of this class is created
 * and attached to a circuits.Service for each method on the service.
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

    var util = new Util(),
        logger = new Logger("debug"),
        module = declare(null, {
            /**
             * @constructor
             * @param methodName {String} - the name of the service method wrapped by this instance.
             * @param reader {circuits.ServiceDescriptorReader} - the reader used to obtain information about the service.
             * @param provider {circuits.DataProvider} - the object providing low-level data access.
             */
            constructor: function (methodName, reader, provider) {
                this.name = methodName;
                this.reader = reader;
                this.provider = provider;
                this.responsePayloadName = reader.getResponsePayloadName(this.name);
                this.requestPayloadName = reader.getRequestPayloadName(this.name);
                this.transport = reader.getMethodTransport(this.name);
                this.smdMethod = reader.getMethod(this.name);
                this.jsonpCallbackParameter = reader.getJsonpCallbackParameter();
            },

            /**
             * Call this service method with the provided params and plugins.
             * Note: that this is not generally expected to be called directly by developers - see the Service
             * class for an example of how it is wrapped up in a service-specific named method.
             * @param params {Object} - the parameters to the service call, these are service-call specific as defined by the SMD this
             *  service is based on. There is special handling for request payloads (e.g. for POST's and PUT's):
             *  - If params.payload exists it is used as the initial payload, otherwise params is used.
             *  - If the initial payload does not have the structure expected by the type defined in the SMD, it is coerced
             *      into that structure before processing.
             * @param plugins {hash by type of arrays of circuits.Plugin's} - the plugins that should be applied to this invocation.
             */
            invoke: function (params, plugins) {
                logger.debug("Calling service method: " + this.name + " with params", params);

                var that = this,
                    provider = this.provider,
                    method = this.transport,
                    url = this.reader.getServiceUrl(this.name, params),
                    smdReturn = this.reader.getResponseSchema(this.name),
                    payloadParamDef = this.reader.getRequestPayloadParam(this.name),
                    headers = {"Content-Type": "application/json"},
                    intermediate,
                    requestPayload = params.payload || params,
                    newParams = util.mixin({}, params),
                    responseType = (smdReturn.type === "any" ? "blob" : "json"),
                    providerHandler = function (statusCode, data, ioArgs) {
                        var status = statusCode.toString(),
                            payload = (statusCode < 400) ? that.processResponse(statusCode, data, plugins, ioArgs) : data,
                            total = 0;

                        //add the total from the payload if it is an array response. putting it in the request object, as that is where http status, etc. is stored.
                        newParams.request.total = data && data.total;

                        //links should be sitting alonside the actual payload, like the total.
                        newParams.links = data && data.links;

                        total = data && data.total; //XXX: temporary transitional leaving it here. some projects expect it as the third arg in callback below

                        util.executePluginChain(plugins.handler, function (plugin) {
                            var regex = new RegExp(plugin.statusPattern);
                            newParams.plugin = plugin;
                            if (regex.test(status)) {
                                plugin.fn.call(plugin.scope || plugin, payload, newParams, total);
                            }
                        });
                    },

                    providerProgress = function (event) {
                        util.executePluginChain(plugins.progress, function (plugin) {
                            plugin.fn.call(plugin.scope || plugin, event.lengthComputable, event.loaded, event.total);
                        });
                    };

                //modify the URL with any plugins
                util.executePluginChain(plugins.url, function (plugin) {
                    url = plugin.fn.call(plugin.scope || plugin, url, that);
                });

                // Use a plugged-in provider if there is one
                if (plugins.provider && plugins.provider.length > 0) {
                    provider = plugins.provider[plugins.provider.length - 1];
                    provider = provider.fn.call(provider.scope || provider, this);
                }

                // Allow request plugins to execute
                util.executePluginChain(plugins.request, function (plugin) {
                    intermediate = plugin.fn.call(plugin.scope || plugin, requestPayload, that, headers);
                    requestPayload = intermediate || requestPayload;
                });

                // Only execute payload plugins if the method expects a payload.
                if (provider.httpMethodMap[method].hasPayload) {
                    // add Content-Type header if there is a payload and it has an enctype.
                    if (payloadParamDef && payloadParamDef.enctype) {
                        headers["Content-Type"] = payloadParamDef.enctype;
                        // it's a regular payload so process it.
                    } else {
                        requestPayload = this.processRequest(requestPayload, plugins);
                    }
                }

                logger.debug("Calling method [" + this.name + "] with URL: " + url);

                newParams.request = provider[provider.httpMethodMap[method].method]({
                    url: url,
                    headers: headers,
                    payload: requestPayload,
                    handler: providerHandler,
                    onprogress: providerProgress,
                    asynchronous: params.asynchronous,
                    dontExecute: true
                });

                if (smdReturn.type === "any") {
                    newParams.request.url = url;
                    newParams.request.mediaType = this.smdMethod.contentType || "";
                    logger.debug("Setting request for returnType=any  " + newParams.request);
                } else if (method === "JSONP") {
                    console.log("need to do something with params and url for jsonp request.");
                } else {
                    newParams.request.execute();
                }

                return newParams.request;
            },

            /**
             * An internal method used by invoke to massage and perform plugin processing on
             * a request payload. The method attempts to coerce the payload into the type specified
             * in the smd and then runs the 'request' and 'write' plugins returning the new payload.
             *
             * @param payload{Object} payload - the request data passed to the service method by the client.
             * @param plugins - the plugins applicable to this service call.
             * @returns {Object} newPayload - the new or modified payload.
             */
            processRequest: function (payload, plugins) {
                var writePayload = payload || "", intermediate, that = this;

                // Very simiplistic payload type coercion
                if (this.requestPayloadName && !payload[this.requestPayloadName]) {
                    payload = {};
                    payload[this.requestPayloadName] = writePayload;
                }

                writePayload = (this.requestPayloadName && payload[this.requestPayloadName]) || payload;

                // Allow write plugins to execute
                util.executePluginChain(plugins.write, function (plugin) {
                    if (util.isArray(writePayload)) {
                        writePayload.forEach(function (item, idx) {
                            intermediate = plugin.fn.call(plugin.scope || plugin, item, that);
                            writePayload[idx] = intermediate || writePayload[idx];
                        }, that);
                    } else {
                        intermediate = plugin.fn.call(plugin.scope || plugin, writePayload, that);
                        writePayload = intermediate || writePayload;
                    }
                });

                if (this.requestPayloadName) {
                    payload[this.requestPayloadName] = writePayload;
                } else {
                    payload = writePayload;
                }

                return payload;
            },

            /**
             * An internal method used by the handler method generated by invoke to perform plugin processing on the
             * response data.
             * @param statusCode {Number} The status code from the request
             * @param data {Object} The response data returned by the provider
             * @param plugins {Array of circuits.Plugin} The merged plugins for the invocation
             * @param ioArgs {Object} The object used to generate the request
             */
            processResponse: function (statusCode, data, plugins, ioArgs) {
                var isList = this.reader.isListResponse(this.name),
                //TODO: "any" is JSONSchema default if no type is defined. this should come through a model though so we aren't tacking it on everywhere
                    returnType = this.reader.getResponseSchema(this.name).type || "any", //this could fail if there is no "returns" block on the method
                    payload,
                    items,
                    that = this,
                    intermediate,
                    successfulResponsePattern = '(2|3)\\d\\d';

                //only auto-process responses if not JSONSchema "null" primitive type
                if (returnType && returnType !== "null") {
                    if (typeof (data) === "object") {
                        //first we apply any global response plugins to the raw data
                        //warning: if the plugin doesn't write it back out with the correct payload name,
                        //it will cause an issue below
                        util.executePluginChain(plugins.response, function (plugin) {
                            // filter plugins on statusPattern
                            var statusPattern = plugin.statusPattern || successfulResponsePattern,
                                regex = new RegExp(statusPattern);
                            if (regex.test(statusCode)) {
                                intermediate = plugin.fn.call(plugin.scope || plugin, data, that, ioArgs);
                                data = intermediate || data;
                            }
                        });
                    }

                    payload = data;

                    if (this.responsePayloadName !== null && data[this.responsePayloadName]) {

                        payload = data[this.responsePayloadName];

                        logger.debug("Extracting payload for [" + this.name + "] from [" + this.payloadName + "] property", payload);
                    }


                    //apply any read plugins supplied, after receiving the server results
                    util.executePluginChain(plugins.read, function (plugin) {
                        // filter plugins on statusPattern
                        var statusPattern = plugin.statusPattern || successfulResponsePattern,
                            regex = new RegExp(statusPattern);
                        if (regex.test(statusCode)) {
                            if (isList) {
                                payload.some(function (item, idx) {
                                    intermediate = plugin.fn.call(plugin.scope || plugin, item, that);
                                    payload[idx] = intermediate || payload[idx];
                                }, that);
                            } else {
                                intermediate = plugin.fn.call(plugin.scope || plugin, payload, that);
                                payload = intermediate || payload;
                            }
                        }
                    });

                }


                this.data = payload; //hold on to a copy for future use (could be undefined of course)

                return payload;
            }

        });
    return module;
});
