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
        
        b = new TestCase("TestGetValuePlugin", {
            
            setup: function () {
            },
            
            //Tests that the constructor properly instantiates properties
            testDefaultConstructor: function () {
                var service = factory.getService(CaseService, {});
                
                assertEquals("mixin", valuePlugin.type);
                
                assertEquals(undefined, service.getValue);
                valuePlugin.fn(service);
                assertNotEquals(undefined, service.getValue);
        
            },
            
            //Using an object with the values already defined, ensures that getValue
            //returns the value currently stored there.  Also ensures that getValue
            //does not override stored values with the passed defaultValue.
            testOnItemWithPropsDefined: function () {
                var service = factory.getService(CaseService, {}),
                    shouldBe10, 
                    shouldBeBlah;    
                
                valuePlugin.fn(service);
                shouldBe10 = service.getValue(item1, "number10", 4);
                shouldBeBlah = service.getValue(item1, "stringBlah", "not Blah");
                
                assertEquals(10, shouldBe10);
                assertEquals("Blah", shouldBeBlah);
            },
            
            //Using an object with the values declared but undefined, ensures that getValue
            //returns the passed defaultValue and that it overrides the stored undefined value
            //in the object.
            testOnItemWithDeclaredButUndefinedProps: function () {
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
                
                assertEquals(40, shouldBe40);
                assertEquals("NewStr", shouldBeNewStr);
                assertEquals(null, shouldBeNull);
                assertEquals(undefined, shouldBeUndefined);
                
                assertEquals(undefined, item1.undefinedNum);
                assertEquals(undefined, item1.undefinedString);
                assertEquals(undefined, item1.undefinedNull);
                assertEquals(undefined, item1.undefinedUndefined);
            },
            
            //Using an object with a null value, ensures that null is returned, not the default value
            //as would happen with undefined.
            testOnItemWithNullValue: function () {
                var service = factory.getService(CaseService, {}),
                    shouldBeNull;    
                
                valuePlugin.fn(service);
                shouldBeNull = service.getValue(item1, "nullStaysNull", "Not null");
        
                assertEquals(null, shouldBeNull);
                
                assertEquals(null, item1.nullStaysNull);
            },
            
            //Using an object with no values declared, getValue should return the defaults because
            //undeclared values should be the same as undefined values. The defaultValue should
            //be returned but the values should still be undefined in the object
            testOnItemWithUndeclared: function () {
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
                
                assertEquals(40, shouldBe40);
                assertEquals("NewStr", shouldBeNewStr);
                assertEquals(null, shouldBeNull);
                assertEquals(undefined, shouldBeUndefined);
                
                assertEquals(undefined, item2.undefinedNum);
                assertEquals(undefined, item2.undefinedString);
                assertEquals(undefined, item2.undefinedNull);
                assertEquals(undefined, item2.undefinedUndefined);
            },
            
            
        });
    });
