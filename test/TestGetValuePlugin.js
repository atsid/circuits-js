require([
    "circuits/plugins/GetValuePlugin",
    "circuits/ServiceFactory",
    "Schema/services/CaseService",
    "test/SyncResolveServices"
], function (
    GetValuePlugin,
    Factory,
    CaseService,
    SyncResolveServices
) {
    
        var b,
            valuePlugin = new GetValuePlugin(),
            factory = new Factory({
                resolver: SyncResolveServices
            }),
            item1 = {
                number10: 10,
                stringBlah: "Blah",
                undefinedNum: undefined,
                undefinedString: undefined,
                undefinedNull: undefined,
                undefinedUndefined: undefined,
                nullStaysNull: null
            },
            item2 = {
                
            };
        
        describe("Test GetValuePlugin", function () {
            it("Tests that the constructor properly instantiates properties", function () {
                var service = factory.getService(CaseService, {});
                
                assert.equal("mixin", valuePlugin.type);
                
                assert.equal(undefined, service.getValue);
                valuePlugin.fn(service);
                assert.notEqual(undefined, service.getValue);
        
            });
            
            it("Using an object with the values already defined, ensures that getValue returns the value currently stored there.  Also ensures that getValue does not override stored values with the passed defaultValue.", function () {
                var service = factory.getService(CaseService, {}),
                shouldBe10, 
                shouldBeBlah;    
            
                valuePlugin.fn(service);
                shouldBe10 = service.getValue(item1, "number10", 4);
                shouldBeBlah = service.getValue(item1, "stringBlah", "not Blah");
                
                assert.equal(10, shouldBe10);
                assert.equal("Blah", shouldBeBlah);
            });
            
            it("Using an object with the values declared but undefined, ensures that getValue returns the passed defaultValue and that it overrides the stored undefined value in the object.", function () {
                var service = factory.getService(CaseService, {}),
                shouldBe40, 
                shouldBeNewStr, 
                shouldBeNull, 
                shouldBeUndefined;    
            
                valuePlugin.fn(service);
                shouldBe40 = service.getValue(item1, "undefinedNum", 40);
                shouldBeNewStr = service.getValue(item1, "undefinedString", "NewStr");
                shouldBeNull = service.getValue(item1, "undefinedNull", null);
                shouldBeUndefined = service.getValue(item1, "undefinedUndefined", undefined);
                
                assert.equal(40, shouldBe40);
                assert.equal("NewStr", shouldBeNewStr);
                assert.equal(null, shouldBeNull);
                assert.equal(undefined, shouldBeUndefined);
                
                assert.equal(undefined, item1.undefinedNum);
                assert.equal(undefined, item1.undefinedString);
                assert.equal(undefined, item1.undefinedNull);
                assert.equal(undefined, item1.undefinedUndefined);
            });
            
            it("Using an object with a null value, ensures that null is returned, not the default value as would happen with undefined.", function () {
                var service = factory.getService(CaseService, {}),
                shouldBeNull;    
            
                valuePlugin.fn(service);
                shouldBeNull = service.getValue(item1, "nullStaysNull", "Not null");
        
                assert.equal(null, shouldBeNull);
                
                assert.equal(null, item1.nullStaysNull);
            });
            
            it("//Using an object with no values declared, getValue should return the defaults because undeclared values should be the same as undefined values. The defaultValue should be returned but the values should still be undefined in the object", function (){
                var service = factory.getService(CaseService, {}),
                shouldBe40, 
                shouldBeNewStr, 
                shouldBeNull, 
                shouldBeUndefined;    
            
                valuePlugin.fn(service);
                shouldBe40 = service.getValue(item2, "undefinedNum", 40);
                shouldBeNewStr = service.getValue(item2, "undefinedString", "NewStr");
                shouldBeNull = service.getValue(item2, "undefinedNull", null);
                shouldBeUndefined = service.getValue(item2, "undefinedUndefined", undefined);
                
                assert.equal(40, shouldBe40);
                assert.equal("NewStr", shouldBeNewStr);
                assert.equal(null, shouldBeNull);
                assert.equal(undefined, shouldBeUndefined);
                
                assert.equal(undefined, item2.undefinedNum);
                assert.equal(undefined, item2.undefinedString);
                assert.equal(undefined, item2.undefinedNull);
                assert.equal(undefined, item2.undefinedUndefined);
            });
        });
        
    });
