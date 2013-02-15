require([
    "circuits/plugins/DataProviderPlugin",
    "circuits/ServiceFactory",
    "circuits/Service",
    "circuits/Logger",
    "test/SyncResolveServices"
], function (
    DataProviderPlugin,
    Factory,
    Service,
    OreLogger,
    SyncResolveServices
) {
    var b,
        conf = new OreLogger("debug"),
        serviceFactoryCRUD,
        origServiceCRUD,
        genericizedServiceCRUD,
        dataProviderPlugin = new DataProviderPlugin({
            create: "createModel",
            read: "readModel",
            update: "updateModel",
            remove: "deleteModel"
        });

    // test standard CRUD operations of a service using a factory to create, plugins to process results
    // etc...
    b = new TestCase("TestDataProviderPlugin", {

        setUp: function () {
            serviceFactoryCRUD = new Factory({
                resolver: SyncResolveServices
            });
            origServiceCRUD = serviceFactoryCRUD.getServiceByName("Schema/SimpleTestServiceSchema");
            genericizedServiceCRUD = serviceFactoryCRUD.getServiceByName("Schema/SimpleTestServiceSchema", [dataProviderPlugin]);
        },

        testGenericHasOriginal: function () {
            assertNotUndefined(genericizedServiceCRUD.createModel);
            assertNotUndefined(genericizedServiceCRUD.readModel);
            assertNotUndefined(genericizedServiceCRUD.updateModel);
            assertNotUndefined(genericizedServiceCRUD.deleteModel);
        },

        testGenericHasGeneric: function () {

            conf.debug("*+*+*+*+*++*+*+++++origServiceCRUD.create = " + origServiceCRUD.create);
            assertNotUndefined(genericizedServiceCRUD.create);
            assertNotUndefined(genericizedServiceCRUD.read);
            assertNotUndefined(genericizedServiceCRUD.update);
            assertNotUndefined(genericizedServiceCRUD.remove);
        },

        testOriginalLacksGeneric: function () {
            assertUndefined(origServiceCRUD.create);
            assertUndefined(origServiceCRUD.read);
            assertUndefined(origServiceCRUD.update);
            assertUndefined(origServiceCRUD.remove);
        },

        testGenericEquality: function () {
            assertEquals(String(origServiceCRUD.createModel), String(genericizedServiceCRUD.create));
            assertEquals(String(origServiceCRUD.readModel), String(genericizedServiceCRUD.read));
            assertEquals(String(origServiceCRUD.updateModel), String(genericizedServiceCRUD.update));
            assertEquals(String(origServiceCRUD.deleteModel), String(genericizedServiceCRUD.remove));
        }
    });

});
