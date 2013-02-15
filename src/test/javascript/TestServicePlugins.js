require([
    "circuits/ServiceFactory",
    "circuits/Service",
    "circuits/ZypSMDReader",
    "circuits/Request",
    "circuits/DataProvider",
    "Schema/SimpleTestModelSchema",
    "Schema/SimpleTestModelResponseSchema",
    "Schema/models/SimpleTestModel",
    "Schema/SimpleTestServiceSchema",
    "circuits/declare",
    "Schema/responses/SimpleTestModelResponse",
    "Schema/responses/SimpleTestModelListResponse",
    "circuits/util",
    "test/SyncResolveServices"
], function (
    Factory,
    Service,
    Reader,
    Request,
    DataProvider,
    SimpleTestModelSchema,
    SimpleTestModelResponseSchema,
    SimpleTestModel,
    SimpleTestServiceSchema,
    declare,
    SimpleTestModelResponse,
    SimpleTestModelListResponse,
    Util,
    SyncResolveServices
) {
        /**
         * Test plugin usage during service calls.
         */
        var b,
            util = new Util(),
            sclone = function (obj) {
                var ret;
                if (obj instanceof Array) {
                    ret = [].concat(obj);
                } else if (obj instanceof Object) {
                    Object.keys(obj).forEach(function (key) {
                        ret = ret || {};
                        if (obj[key] instanceof Object) {
                            ret[key] = sclone(obj[key]);
                        } else {
                            ret[key] = obj[key];
                        }
                    });
                } else {
                    ret = obj;
                }
                return ret;
            },
            MockProviderTSP = declare(DataProvider, {
                resp: SimpleTestModelResponse,
                listResp: SimpleTestModelListResponse,
                create: function (params) {
                    var ret = sclone(this.resp);
                    ret.model.ceatedByMock = true;
                    params.handler.call(b, 200, ret, params);
                    return new Request({}, function () {});
                },
                read: function (params) {
                    var ret;
                    if (params.url.indexOf('123') !== -1) {
                        ret = sclone(this.resp);
                        ret.model.readByMock = true;
                    } else {
                        ret = sclone(this.listResp);
                        ret.msg = "readByMock";
                    }
                    params.handler.call(b, 200, ret, params);
                    return new Request({}, function () {});
                },
                update: function (params) {
                    var ret = sclone(this.resp);
                    ret.model.updatedByMock = true;
                    params.handler.call(b, 200, ret, params);
                    return new Request({}, function () {});
                },
                del: function (params) {
                    var ret = sclone(this.resp);
                    ret.model.deletedByMock = true;
                    params.handler.call(b, 200, ret, params);
                    return new Request({}, function () {});
                }
            }),
            mockProviderTSP = new MockProviderTSP(),
            serviceFactoryTSP,
            serviceTSP,
            factoryGotData,
            factoryErrorCalled,
            factoryRequestCalled,
            factoryResponseCalled,
            factoryReadCalled,
            factoryCorrectScope,
            additionalPluginCalled,
            additionalPluginCalledWithCorrectScope,
            additionalPlugin = {
                scope: {correctScope: true},
                type: 'handler',
                statusPattern: '(2|3)\\d\\d',
                stopProcessing: true,
                fn: function (data, params, total) {
                    additionalPluginCalled = true;
                    if (this.correctScope) {
                        additionalPluginCalledWithCorrectScope = true;
                    }
                }
            },
            factoryPlugins =  [
                {
                    type: 'url',
                    fn: function (url, method) {
                        return url + "plugincalled";
                    }
                },
                {
                    type: 'handler',
                    statusPattern: '(2|3)\\d\\d',
                    fn: function (data, params, total) {
                        factoryGotData = data;
                        if (this.type) {
                            factoryCorrectScope = true;
                        }
                    }
                },
                {
                    type: 'handler',
                    statusPattern: '(4|5)\\d\\d',
                    fn: function (data, params) {
                        factoryErrorCalled = true;
                    }
                },
                {
                    type: 'mixin',
                    fn: function (svc) {
                        svc.factoryGotMixin = true;
                    }
                },
                {
                    type: 'request',
                    fn: function (data, params) {
                        factoryRequestCalled = true;
                        return data;
                    }
                },
                {
                    type: 'response',
                    fn: function (data, params) {
                        factoryResponseCalled = true;
                        return data;
                    }
                },
                {
                    type: 'read',
                    fn: function (data, params) {
                        factoryReadCalled = true;
                        return data;
                    }
                }
            ];
    
    
        // test combinations of plugin processing.
        b = new TestCase("TestServicePlugins", {
    
            setUp: function () {
                serviceFactoryTSP = new Factory({provider: mockProviderTSP, plugins: factoryPlugins, resolver: SyncResolveServices});
                serviceTSP = serviceFactoryTSP.getServiceByName("Schema/SimpleTestServiceSchema");
                factoryGotData = null;
                factoryErrorCalled = false;
                factoryRequestCalled = false;
                factoryResponseCalled = false;
                factoryReadCalled = false;
                factoryCorrectScope = false;
                additionalPluginCalled = false;
                additionalPluginCalledWithCorrectScope = false;
            },
    
            // test factory level plugins
            testFactoryLevelNonListPlugins: function () {
                serviceTSP.readModel({modelNumber: "123"});
                assertFalse(factoryGotData === null);
                assertTrue(factoryCorrectScope);
                assertTrue(factoryGotData.readByMock);
                assertTrue(serviceTSP.factoryGotMixin);
                assertTrue(factoryReadCalled);
                assertTrue(factoryResponseCalled);
                assertFalse(factoryRequestCalled);
            },
    
            // test factory level plugins
            testFactoryLevelListPlugins: function () {
                serviceTSP.listModel({});
                assertFalse(factoryGotData === null);
                assertTrue(factoryGotData.length > 0);
                assertTrue(serviceTSP.factoryGotMixin);
                assertTrue(factoryReadCalled);
                assertTrue(factoryResponseCalled);
                assertFalse(factoryRequestCalled);
            },
    
            // test service level plugin overrides
            testServiceLevelOverride: function () {
                serviceTSP.addPlugin(additionalPlugin);
                serviceTSP.readModel({modelNumber: "123"});
                assertTrue(factoryGotData === null);
                assertTrue(serviceTSP.factoryGotMixin);
                assertTrue(factoryReadCalled);
                assertTrue(factoryResponseCalled);
                assertFalse(factoryRequestCalled);
                assertTrue(additionalPluginCalled);
                assertTrue(additionalPluginCalledWithCorrectScope);
                additionalPluginCalled = false;
    
                // remove should work
                serviceTSP.removePlugin(additionalPlugin);
                serviceTSP.readModel({modelNumber: "123"});
                assertFalse(factoryGotData === null);
                assertTrue(serviceTSP.factoryGotMixin);
                assertTrue(factoryReadCalled);
                assertTrue(factoryResponseCalled);
                assertFalse(factoryRequestCalled);
                assertFalse(additionalPluginCalled);
            },
    
            // test invocation level plugin overrides
            testInvocationLevelOverride: function () {
                //Should override
                serviceTSP.readModel({modelNumber: "123"}, [additionalPlugin]);
                assertTrue(factoryGotData === null);
                assertTrue(serviceTSP.factoryGotMixin);
                assertTrue(factoryReadCalled);
                assertTrue(factoryResponseCalled);
                assertFalse(factoryRequestCalled);
                assertTrue(additionalPluginCalled);
                assertTrue(additionalPluginCalledWithCorrectScope);
                additionalPluginCalled = false;
    
                //should still work without override
                serviceTSP.readModel({modelNumber: "123"});
                assertFalse(factoryGotData === null);
                assertTrue(serviceTSP.factoryGotMixin);
                assertTrue(factoryReadCalled);
                assertTrue(factoryResponseCalled);
                assertFalse(factoryRequestCalled);
                assertFalse(additionalPluginCalled);
            },
    
            // test "provider" plugin execution.
            testProviderPlugin: function () {
                var Provider = declare(DataProvider, {
                    create: function (params) {
                        params.payload.overrideCreate = true;
                        return new Request({}, function () {});
                    },
                    read: function (params) {
                        params.payload.overrideRead = true;
                        return new Request({}, function () {});
                    },
                    update: function (params) {
                        params.payload.overrideUpdate = true;
                        return new Request({}, function () {});
                    },
                    del: function (params) {
                        params.payload.overrideDelete = true;
                        return new Request({}, function () {});
                    }
                }),
                    providerPlugin = {
                        type: 'provider',
                        fn: function (serviceMethod) {
                            return new Provider();
                        }
                    },
                    service = serviceFactoryTSP.getServiceByName("Schema/SimpleTestServiceSchema", [providerPlugin]),
                    model = {modelNumber: "123"};
    
                service.readModel(model);
    
                assertTrue(model.overrideRead);
    
                model = {modelNumber: "123"};
                service = serviceFactoryTSP.getServiceByName("Schema/SimpleTestServiceSchema");
                service.readModel(model);
    
                assertUndefined(model.overrideRead);
    
                service.readModel(model, [providerPlugin]);
                assertTrue(model.overrideRead);
            }
    
        });
    });

