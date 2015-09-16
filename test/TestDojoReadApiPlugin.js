define([
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
         *               });

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
        var b,
            conf = new OreLogger("debug"),
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

        describe("TestDojoReadApiPlugin", function() {

            //Tests that the constructor properly instantiates properties
            it("testDefaultConstructor",  function () {
                var service = factory.getService(CaseService, {});

                assert.equal("mixin", apiPlugin.type);

                assert.equal(undefined, service.getValue);
                apiPlugin.fn(service);
                assertNotEquals(undefined, service.getValue);

            });


            //Test fetch with service string
            it("testFetchServiceString",  function () {
                var service = factory.getService(CaseService, {}),
                    shouldBe10,
                    args;
                args = {caseNumber: '123'};
                apiPlugin.fn(service);
                shouldBe10 = service.fetch(args);
                conf.debug(shouldBe10);
            });


            //Test fetch with a passed in function.
            it("testFetchServiceFunction",  function () {
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
                assert.equal(17, serviceReturn.id);
                assert.equal('23.98767', serviceReturn.caseNumber);
            });


            //Test that the fetch will call onBegin() when onComplete() is called.
            it("testFetchCallsOnBegin",  function () {
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

                assert.isTrue('Testing the onBegin handler', calledOnBegin);
                assert.isTrue('Testing the onComplete handler', calledOnComplete);
            });


            //Test the getValue function.
            it("testGetValue",  function () {
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

                assert.isTrue(shouldBeTrue);

                assert.equal(40, shouldBe40);
                assert.equal("NewStr", shouldBeNewStr);
                assert.equal(null, shouldBeNull);
                assert.equal(undefined, shouldBeUndefined);

                assert.equal(undefined, item2.undefinedNum);
                assert.equal(undefined, item2.undefinedString);
                assert.equal(undefined, item2.undefinedNull);
                assert.equal(undefined, item2.undefinedUndefined);
            });


            it("testGetIdentity",  function () {
                var service = factory.getService(CaseService, {}),
                    item = {caseNumber: '12.9878',
                            description: 'This is just a description.',
                            id: 17,
                            documentId: '98.454.9874'};
                apiPlugin.fn(service);

                assert.equal('12.9878', service.getIdentity(item));
            });


            it("testGetIdentityAttributesDefined",  function () {
                var service = factory.getService(CaseService, {});
                apiPlugin.fn(service);

                assert.equal('caseNumber', service.getIdentityAttributes());
            });


            it("testGetIdentityAttributesUndefined",  function () {
                var service = factory.getService(CaseService, {}),
                    myApiPlugin = new ApiPlugin({
                        methodName: 'readCase',
                        methodArgs: 'caseNumber'
                    });
                myApiPlugin.fn(service);

                assert.equal('id', service.getIdentityAttributes());
            }
        });
    });