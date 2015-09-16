/**
 * @class circuits/Plugin
 * Convenience class for making plugin objects. Plugins provide a way to tailor the behavior of circuits for a given service
 * throughout the request/response cycle.
 *
 * Plugin types that control the request/response cycle:
 * 'read'     - executed after response payload extraction, applied to the response item (or each item if a list)
 *              The associated function is of the form: function({Object} fullPayloadOrItem, {circuits.ServiceMethod} method).
 * 'write'    - executed before PUT/POST to the server, applied to the request item (or each item if a list)
 * 'url'      - executed after the url for the service method is generated, before the request is sent, used to modify the generated url.
 *              The associated function is of the form: function({String} url, {circuits.ServiceMethod} method).
 * 'request'  - executed before any requests are sent, applied to the raw JS request object. The associated function is of the form:
 *              function({Object} payload, {circuits.ServiceMethod} method, headers).
 * 'response' - executed as soon as the response is received, applied to the raw JSON payload
 *              The associated function is of the form: function({Object} fullPayload, {circuits.ServiceMethod} method, ioArgs).
 * 'handler'  - this plugin type is used to process either the completed response or an error that occurs during the
 *              request/response cycle.
 * The difference between read/response and write/request is that the read/write plugins are executed against every
 * structured item, whereas the response/request plugins are executed against raw data and therefore allow complete manipulation of the object.
 *
 * Plugin types that alter or provide objects used to support a given service or method invocation.
 * 'mixin'    - this plugin type is used to modify the Service instance itself, such as by adding custom methods. It is invoked when a new
 *              service is constructed.
 *              The associated function is of the form: function({circuits.Service} service).
 * 'provider' - this plugin type is used to supply a SATLMINE.DataProvider that will override the factory-configured
 *              provider. The supplied function is expected to return a circuits.DataProvider derived object and
 *              is of the form: function({circuits.ServiceMethod} serviceMethod).
 * 'progress' - a plugin to respond to progress information for uploads and downloads. It accepts the three xhr arguments:
 *              boolean lengthComputable - whether "total" is valid for computing progress,
 *              number loaded - size that has been transfered so far,
 *              number total - total size if known
 */
define([
    "./declare",
    "./util",
    "./log"
], function (
    declare,
    Util,
    logger
) {
    var util = new Util(),
        module = declare(null, {
        /**
         * Plugins accept a config object with the following known properties:
         *
         * @param config
         *   name - (optional if plugin is never removed) unique name of the plugin for adding/removing from services
         *   type - (required) type of plugin, indicating where it is applied.
         *      Valid types are "read", "write", "url", "request", "response", "mixin", "provider", "progress" and "handler"
         *   fn - (required) the function to execute for plugin calls, e.g. the actual plugin.
         *   scope - (optional) the scope to execute the plugin function with, if absent the plugin is executed with the plugin as its scope.
         *   stopProcessing - (optional) boolean specifying whether or not this plugin should override more general plugins. Default is false.
         *   pointcut - (optional) "regex" string of the service/method the plugin applies to. E.g., *.* is global, *.read* is all methods
         *      prefixed with "read" on all services. Note this is not quite JS regexp format - it emulates AOP pointcut syntax for simplicity.
         *      Default is "*.*".

         *      See the circuits.PluginMatcher class for more information
         *   pattern - (optional) a full JS regular expression that will be matched against a string of the form: "ServiceName.ServiceMethod".
         *      See the circuits.PluginMatcher class for more information
         *   statusPattern - (optional)
         *
         * The above properties are required in order to create a functional plugin. Additional properties can also be
         * specified in the config arg, and these can be used during function execution. They should not be named the same as the above
         * required properties, of course.
         */
        constructor: function (config) {
            logger.debug("Applying config to new plugin: ", config && (config.name || config.type));
            util.mixin(this, config);
        }
    });

    return module;
});