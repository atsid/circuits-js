require([
    "circuits/plugins/DojoReadApiPlugin",
    "circuits/ServiceFactory",
    "Schema/services/CaseService",
    "circuits/Logger",
    "circuits/DojoXhrDataProvider"
], function (
    ApiPlugin,
    Factory,
    CaseService,
    OreLogger,
    DojoXhrDataProvider
) {

        /*
         *            caseDocPlugin = new circuits.plugins.DojoReadApiPlugin({
         *               pointcut: "CaseDocumentsService.*",
         *               name: "caseDocGetValueMixin",
         *               identityAttributes: "id",
         *               methodName: function (args) {
         *                   dojo.mixin(args, {caseNumber: this.caseNumber});
         *                   this.queryOfficeActionsOnly(args, {onLoad: function (items, request) {
         *                       this.scope.actedItems = items;
         *                       dojo.forEach(items, function (item) {
         *                           item.label = item.title + ' ' + PTO.formatters.dateDisplay(item.date);
         *                           item.id = String(item.documentId);
         *                       });
         *                       //Add default value
         *                       items.splice(0, 0, {label: 'Any', id: '0'});
         *                       args.onComplete.call(args.scope, items, request);
         *                   }});
         *               },
         *               methodArgs: ["caseNumber"]
         *           }),
         *
         *            caseDocPlugin = new circuits.plugins.DojoReadApiPlugin({
         *               pointcut: "CaseDocumentsService.*",
         *               name: "caseDocGetValueMixin",
         *               identityAttributes: "id",
         *               methodName: "queryDocumentList",
         *               methodArgs: ["caseNumber"]
         *           }),
         *
         *           caseDocumentStore = PTO.service.get("CaseDocuments", [caseDocPlugin]);
         */
        var conf = new OreLogger("debug"),
            apiPlugin = new ApiPlugin({
                identityAttributes: 'caseNumber',
                methodName: 'readCase',
                methodArgs: 'caseNumber'
            }),
            factory = new Factory({provider: new DojoXhrDataProvider()}),
            item1 = {
                number10: 10,
                stringBlah: "Blah",
                innerObject: {
                    innerProp: true
                },
                undefinedNum: undefined,
                undefinedString: undefined,
                undefinedNull: undefined,
                undefinedUndefined: undefined,
                nullStaysNull: null
            },
            item2 = {
    
            };
        
        describe("Test DojoReadApiPlugin", function () {
            it("Tests that the constructor properly instantiates properties", function () {
                var service = factory.getService(CaseService, {});
                
                assertEquals("mixin", apiPlugin.type);
    
                assertEquals(undefined, service.getValue);
                apiPlugin.fn(service);
                assertNotEquals(undefined, service.getValue);
            });
            
            it("Test fetch with service string", function () {
                var service = factory.getService(CaseService, {}),
                shouldBe10,
                args;
                args = {caseNumber: '123'};
                apiPlugin.fn(service);
                shouldBe10 = service.fetch(args);
                conf.debug(shouldBe10);
            });
            
            it("Test fetch with a passed in function.", function () {
                var myApiPlugin = new ApiPlugin({
                    identityAttributes: 'caseNumber',
                    methodName: function (args) {
                        var retVal = {};
                        retVal.id = 17;
                        retVal[this.getIdentityAttributes()] = '23.98767';
                        retVal.description = 'This is just for testing';
                        return retVal;
                    },
                    methodArgs: 'caseNumber'
                }),
                service = factory.getService(CaseService, {}),
                serviceReturn,
                args = {caseNumber: '123'};
                myApiPlugin.fn(service);
                serviceReturn = service.fetch(args);
                assertEquals(17, serviceReturn.id);
                assertEquals('23.98767', serviceReturn.caseNumber);
            });
            
            it("Test that the fetch will call onBegin() when onComplete() is called.", function () {
                var service = factory.getService(CaseService, {}),
                shouldBe10,
                calledOnBegin,
                calledOnComplete,
                args;
            
                args = {
                    caseNumber: '123',
                    onBegin: function () {
                        calledOnBegin = true;
                    },
                    onComplete: function () {
                        calledOnComplete = true; 
                    }
                };
                service.readCase = function (args, handles) {
                    handles.load();
                }; 
                apiPlugin.fn(service);
                shouldBe10 = service.fetch(args);
                conf.debug(shouldBe10);
                
                assertTrue('Testing the onBegin handler', calledOnBegin);
                assertTrue('Testing the onComplete handler', calledOnComplete);
            });
            
            it("Test the getValue function.", function () {
                var service = factory.getService(CaseService, {}),
                shouldBeTrue,
                shouldBe40,
                shouldBeNewStr,
                shouldBeNull,
                shouldBeUndefined;

                apiPlugin.fn(service);
                shouldBeTrue = service.getValue(item1, "innerObject.innerProp");
                shouldBe40 = service.getValue(item2, "undefinedNum", 40);
                shouldBeNewStr = service.getValue(item2, "undefinedString", "NewStr");
                shouldBeNull = service.getValue(item2, "undefinedNull", null);
                shouldBeUndefined = service.getValue(item2, "undefinedUndefined", undefined);
    
                assertTrue(shouldBeTrue);
                
                assertEquals(40, shouldBe40);
                assertEquals("NewStr", shouldBeNewStr);
                assertEquals(null, shouldBeNull);
                assertEquals(undefined, shouldBeUndefined);
    
                assertEquals(undefined, item2.undefinedNum);
                assertEquals(undefined, item2.undefinedString);
                assertEquals(undefined, item2.undefinedNull);
                assertEquals(undefined, item2.undefinedUndefined);
            });
            
            it("test getIdentity function", function () {
                var service = factory.getService(CaseService, {}),
                item = {caseNumber: '12.9878',
                        description: 'This is just a description.',
                        id: 17,
                        documentId: '98.454.9874'};
            apiPlugin.fn(service);

            assertEquals('12.9878', service.getIdentity(item));
            });
            
            it("test getIdentityAttributesDefined", function () {
                var service = factory.getService(CaseService, {});
                apiPlugin.fn(service);
    
                assertEquals('caseNumber', service.getIdentityAttributes());
            })
            
            it("test getIdentityAttributesUndefined", function () {
                var service = factory.getService(CaseService, {}),
                myApiPlugin = new ApiPlugin({
                    methodName: 'readCase',
                    methodArgs: 'caseNumber'
                });
            myApiPlugin.fn(service);

            assertEquals('id', service.getIdentityAttributes());
            });
        });
    
        
    });