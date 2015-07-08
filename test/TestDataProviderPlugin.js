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

    //setUp
    serviceFactoryCRUD = new Factory({
        resolver: SyncResolveServices
    });
    origServiceCRUD = serviceFactoryCRUD.getServiceByName("Schema/SimpleTestServiceSchema");
    genericizedServiceCRUD = serviceFactoryCRUD.getServiceByName("Schema/SimpleTestServiceSchema", [dataProviderPlugin]);
    
    describe("test standard CRUD operations of a service using a factory to create, plugins to process results, etc.", function () {
        
        it("test GenericHasOriginal", function () {
            assert.isDefined(genericizedServiceCRUD.createModel);
            assert.isDefined(genericizedServiceCRUD.readModel);
            assert.isDefined(genericizedServiceCRUD.updateModel);
            assert.isDefined(genericizedServiceCRUD.deleteModel);
        });
        
        it("test GenericHasGEneric", function () {
            conf.debug("*+*+*+*+*++*+*+++++origServiceCRUD.create = " + origServiceCRUD.create);
            assert.isDefined(genericizedServiceCRUD.create);
            assert.isDefined(genericizedServiceCRUD.read);
            assert.isDefined(genericizedServiceCRUD.update);
            assert.isDefined(genericizedServiceCRUD.remove);
        });
        
        it("test OriginalLackGeneric", function () {
            assert.isUndefined(origServiceCRUD.create);
            assert.isUndefined(origServiceCRUD.read);
            assert.isUndefined(origServiceCRUD.update);
            assert.isUndefined(origServiceCRUD.remove);
        });
        
        it("test GenericEquality", function () {
            assert.equal(String(origServiceCRUD.createModel), String(genericizedServiceCRUD.create));
            assert.equal(String(origServiceCRUD.readModel), String(genericizedServiceCRUD.read));
            assert.equal(String(origServiceCRUD.updateModel), String(genericizedServiceCRUD.update));
            assert.equal(String(origServiceCRUD.deleteModel), String(genericizedServiceCRUD.remove));
        });
    });
    
    

});
