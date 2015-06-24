define([
    "../declare",
    "../Plugin"
], function (
    declare,
    Plugin
) {
    var module =  declare(Plugin, {
        
        /**
         * Maps simple CRUD operations to actual service methods.
         * @param {Object} args should consist of 4 key/value pairs:
         *          create, read, update and remove
         *          Each value should be the equivalent operation on the service.
         */
        constructor: function (args) {
            this.type = "mixin";
            this.fn = function (service) {
                service.create = service[this.create];
                service.read = service[this.read];
                service.update = service[this.update];
                service.remove = service[this.remove];
            };
        }
    });

    return module;
});