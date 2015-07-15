/**
 * Parses an SMD and provides methods to read information from it for working with RESTful services.
 * Uses the format defined by Kris Zyp and utilized by Dojo for RPC stores
 */
define([
    "./declare",
    "./ServiceDescriptorReader",
    "./log",
    "./util",
    "./AmdResolver"
], function (
    declare,
    ServiceDescriptorReader,
    logger,
    Util,
    AmdResolver
) {

    var util = new Util(),
        module = declare(ServiceDescriptorReader, {
            /**
             * Constructor requires a JSONSchema-compliant SMD file in Zyp format.
             */
            constructor: function (schema, refResolver) {

                logger.debug("Creating reader for schema", schema);

                if (!refResolver) {
                    refResolver = new AmdResolver({path: "", altSeparator: "\\.", synchronous: true}).resolver;
                }

                this.smd = schema;

                //finds all $ref instances and replaces with the actual object
                //similar to dojox.json.ref.resolveJson, but doesn't get hung up on circular references
                //TODO: should we assume all schemas have been resolved prior, and remove this step?
                function resolveRef(subobj, parent, parentKey) {
                    if (!subobj.resolved) {
                        Object.keys(subobj).forEach(function (key) {
                            var Ref, value = subobj[key];
                            if (key === "$ref") {
                                logger.debug("Resolving $ref: " + value);
                                Ref = refResolver(value);
                                value = typeof Ref === 'function' ? new Ref() : Ref;
                                if (!util.isUndefined(value) && !value.resolved) {
                                    subobj.resolved = true;
                                    resolveRef(value, subobj, key);
                                }
                                parent[parentKey] = value;
                            } else if (typeof value === "object" && !value.resolved) {
                                subobj.resolved = true;
                                resolveRef(value, subobj, key);
                            }
                        });
                    }
                }
                //*/

                function getExtendedProperties(obj, props) {
                    var parent = (obj && obj["extends"]), propsObj = [], items = [], itemProps;

                    if (typeof parent !== "undefined") {

                        items = util.isArray(parent) ? parent : [parent]; //can be multiple-inheritance

                        items.forEach(function (item) {
                            itemProps = item.properties || {};
                            Object.keys(itemProps).forEach(function (key) {
                                var value = item.properties[key];
                                if (key !== "__parent") {
                                    propsObj.push({
                                        parentId: item.id,
                                        key: key,
                                        value: value
                                    });
                                }
                            });

                        }, this);

                        props.push(propsObj);
                        props = getExtendedProperties(parent, props);
                    }

                    return props;

                }

                //looks in JSONSchema objects for "extends" and copies properties to children
            function resolveExtensions(schema) {

                var xprops, props;

                xprops = getExtendedProperties(schema, []);

                //unwind the property stack so that the earliest gets inheritance link
                schema.properties = schema.properties || {};
                function copyprop(item) { //util to get around jslint complaints about doing this directly in loop
                    schema.properties[item.key] = item.val;
                }

                while (xprops.length > 0) {
                    props = xprops.pop();
                    props.forEach(copyprop);
                }
            }

            // mix-in parameters for extended schemas
            function resolveExtendedParameters(obj) {

                // assume all references are resolved, just copy parameters down the
                // inheritence chain. If I am derived check base first.
                if (obj["extends"]) {
                    resolveExtendedParameters(obj["extends"]);
                    obj.parameters = obj.parameters || [];
                    obj.parameters = obj.parameters.concat(obj["extends"].parameters);
                }
            }

            //copies properties from parent as defaults, as well as extensions for params
            function resolveProperties(schema) {

                logger.debug("Resolving sub-properties for " + schema.id);

                // resolve inherited global parameters
                resolveExtendedParameters(schema);

                Object.keys(schema.services || {}).forEach(function (key) {
                    var value = schema.services[key];
                    //value.target = value.target ? schema.target + value.target : schema.target; //TODO: should this build concat paths? that is currently handled in getServiceUrl function
                    value.returns = value.returns || schema.returns;
                    value.transport = value.transport || schema.transport;
                    value.contentType = value.contentType || schema.contentType;
                    value.envelope = value.envelope || schema.envelope || "URL";
                    value.description = value.description || "";

                    if (value.returns) {
                        resolveExtensions(value.returns);
                    }

                    if (value.parameters) {
                        value.parameters.forEach(function (item) {
                            item.envelope = item.envelope || value.envelope;
                            item.description = item.description || "";
                        });
                    }


                    var ext = value["extends"];

                    if (ext) {

                        //resolution hasn't been completed or extends object isn't proper JSONSchema
                        if (!ext.id) {
                            throw new Error("Parent schema for method [" + key + "] in schema " + schema.id + " is invalid.");
                        }

                        //TODO: resolveExtensions for params object properties? not really needed yet (the name is fine for now...)
                        if (!value.parameters) {
                            value.parameters = ext.parameters;
                        } else {
                            value.parameters = value.parameters.concat(ext.parameters);
                        }
                    }
                });

                if (!schema.tag) {
                    schema.tag = {};
                }
                schema.tag.resolved = true;
                schema.resolvedProperties=true;
            }

            //if a schema has already been resolved, don't do it again - we can get into endless recursion
            if (!schema.resolved) {
                resolveRef(schema, null, null);
                schema.resolved = true;
            }

            //only resolve these once, or else our concats will be a problem
            if (!schema.resolvedProperties) {
                resolveProperties(schema);
            }

            var hash = {};

            //index params array by name for lookup
            hash.parameters = {};
            this.getMethodNames().forEach(function (methodName) {
                var service = this.smd.services[methodName];
                if (service.parameters) {
                    service.parameters.forEach(function (parameter) {
                        hash[methodName + "-" + parameter.name] = parameter;
                    });
                }
            }, this);

            this.findParameter = function (methodName, parameterName) {
                return hash[methodName + "-" + parameterName];
            };

        },

        /**
         * Returns the identifier of the schema this reader operates on.
         */
        getSchemaId: function () {
            return this.smd.id; //TODO: the property name here can be configurable, we may want to support that.
        },

        /**
         * Gets the root target property for the service.
         */
        getRootPath: function () {
            return this.smd.target;
        },

        /**
         * Gets the jsonp callback property for the service.
         */
        getJsonpCallbackParameter: function () {
            return this.smd.jsonpCallbackParameter;
        },
        
        /**
         * Gets the transport property for the service.
         */
        getTransport: function () {
            return this.smd.transport;
        },
        
        /**
         * Gets a list of the service method names defined by the SMD.
         */
        getMethodNames: function () {
            var names = [];

            Object.keys(this.smd.services || {}).forEach(function (serviceName) {
                names.push(serviceName);
            });

            return names;
        },

        /**
         * Gets list of service methods in the SMD. These are the actual schema objects.
         */
        getMethods: function () {
            var services = [], smdServices = this.smd.services;

            Object.keys(smdServices || []).forEach(function (serviceName) {
                services.push(smdServices[serviceName]);
            });

            return services;
        },

        /**
         * Gets a specific service method object by name.
         * TODO: exception if service doesn't exist
         */
        getMethod: function (methodName) {
            var method = this.smd.services[methodName];
            if (!method) {
                throw new Error("no such method");
            }
            return method;
        },

        /**
         * Gets a list of parameter names for a specified service.
         */
        getParameterNames: function (methodName) {
            var names = [], params = this.getParameters(methodName);

            params.forEach(function (param) {
                names.push(param.name);
            });

            return names;
        },

        /**
         * Gets a list of parameters for a specified service. These are the actual objects.
         */
        getParameters: function (methodName) {
            var parameters = this.smd.parameters || [];

            parameters = parameters.concat(this.smd.services[methodName].parameters || []);

            return parameters;
        },

        /**
         * Indicates whether the specified argument on a service method is required or not.
         */
        isArgumentRequired: function (methodName, argName) {
            if(!util.isUndefined(this.findParameter(methodName, argName))){
                var required = this.findParameter(methodName, argName).required;
                //default is false, so if "required" is undefined, return false anyway
                if (required) {
                    return true;
                }
            }
            
            return false;
        },

        /**
         * For the specified service, map the args object to the target + parameters to
         * get a full, functional URL.
         */
        getServiceUrl: function (methodName, args) {

            var service = this.smd.services[methodName],
                basePath = this.getRootPath(),
                url,
                parameters = this.enumerateParameters(service);

            //if no service target, it sits at the root
            url = basePath + (service.target ? "/" + service.target : "");

            //replace path params where required
            url = this.replacePathParamsInUrl(url, parameters.PATH, args);

            //add any query params
            url = this.addQueryParamsToUrl(url, parameters.URL, args);

            return url;

        },

        getMethodTransport: function (methodName) {
            return this.smd.services[methodName].transport;
        },
        
        getMethodTimeout: function (methodName) {
            return this.smd.services[methodName].timeout;
        },

        getAndValidateArgument: function (param, args) {
            args = args || {};
            var arg = typeof args[param.name] !== "undefined" ? args[param.name] : param["default"];

            if (typeof arg === "undefined" && (param.required === true || param.optional === false)) {
                throw new Error("Missing required param for service call: " + param.name);
            }

            return arg;
        },

        replacePathParamsInUrl: function (url, params, args) {

            var index, length, param, arg;

            for (index = 0, length = params.length; index < length; index += 1) {

                param = params[index];
                arg = this.getAndValidateArgument(param, args);

                if (typeof arg !== "undefined") {
                    url = url.replace("{" + param.name + "}", encodeURIComponent(arg));
                }
            }

            return url;

        },

        addQueryParamsToUrl: function (url, params, args) {

            var index, length, queryString = "", param, arg, substring, firstParam = true;

            for (index = 0, length = params.length; index < length; index += 1) {

                param = params[index];
                arg = this.getAndValidateArgument(param, args);

                if (typeof arg !== "undefined") {

                    substring = param.name + "=" + encodeURIComponent(arg);

                    if (firstParam) {
                        firstParam = false;
                        queryString += "?" + substring;
                    } else {
                        queryString += "&" + substring;
                    }

                }
            }

            url += queryString;

            return url;

        },

        /**
         * Returns the param list mapped by envelope (URL, PATH, ENTITY)
         */
        enumerateParameters: function (service) {

            var index, length, parameters = this.smd.parameters, param,
                svcParameters = service.parameters || [],
                params = {
                    PATH: [], //args in URL path
                    URL: [], //args in query string
                    JSON: [], //JSON in POST/PUT body
                    ENTITY: [] //custom POST/PUT entity body (e.g., multi-part)
                };

            parameters = parameters ? parameters.concat(svcParameters) : svcParameters;

            if (parameters) {
                for (index = 0, length = parameters.length; index < length; index += 1) {
                    param = parameters[index];
                    params[param.envelope].push(param);
                }
            }

            return params;

        },

        /**
         * Returns the schema associted with the service method's response.
         * @param methodName - the service method to return a schema for.
         * @return the response schema
         */
        getResponseSchema: function (methodName) {
            return this.smd.services[methodName].returns;
        },

        /**
         * Returns the parameter associated with the payload of a request if there is one.
         * @param methodName - the service method to return a payload schema for.
         * @return the payload parameter or undefined
         */
        getRequestPayloadParam: function (methodName) {
            var params = this.getParameters(methodName),
                ret;
            params.forEach(function (param) {
                if (param && (param.envelope === 'JSON' ||
                        param.envelope === 'ENTITY')) {
                    ret = param;
                }
            });
            return ret;
        },

        /**
         * Returns the schema associated with the payload of a request if there is one.
         * @param methodName - the service method to return a payload schema for.
         * @return a model schema or undefined if there is no payload.
         */
        getRequestSchema: function (methodName) {
            var param = this.getRequestPayloadParam(methodName),
                ret = param && param.type;
            return ret;
        },

        /**
         * Returns the name of the primary payload object.
         * @param methodName - the service method to return a payload schema for.
         * If the "payload" field is not defined on the method, check the service root.
         */
        getResponsePayloadName: function (methodName) {

            var smd = this.smd,
                method = smd.services[methodName],
                payloadName = (method && method.payload) || smd.payload;

            return payloadName;
        },

        /**
         * Returns the name of the primary payload object.
         * @param methodName - the service method to return a payload schema for.
         */
        getRequestPayloadName: function (methodName) {

            var param = this.getRequestPayloadParam(methodName),
                payloadName = param && param.payload;

            return payloadName;
        },

        /**
         * Returns whether the primary payload is a list, by checking for "array" type on the SMD.
         * Defaults to false if return type is JSONSchema "null" primitive type.
         */
        isListResponse: function (methodName) {
            var response = this.getResponseSchema(methodName),
                payloadName = this.getResponsePayloadName(methodName),
                isList = false;

            if (response.type !== "null") {
                if ((payloadName && response.properties[payloadName] && response.properties[payloadName].type === "array") ||
                        (response.type && response.type === "array")) {
                    isList = true;
                }
            }

            return isList;
        }

    });

    return module;
});
