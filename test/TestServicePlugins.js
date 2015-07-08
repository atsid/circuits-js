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
                    params.request = new Request({}, function () {
                        params.handler.call(b, 200, ret, params);
                    });
                    return params.request;
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
                    params.request = new Request({}, function () {
                        params.handler.call(b, 200, ret, params);
                    });
                    return params.request;
                },
                update: function (params) {
                    var ret = sclone(this.resp);
                    ret.model.updatedByMock = true;
                    params.request = new Request({}, function () {
                        params.handler.call(b, 200, ret, params);
                    });
                    return params.request;
                },
                del: function (params) {
                    var ret = sclone(this.resp);
                    ret.model.deletedByMock = true;
                    params.request = new Request({}, function () {
                        params.handler.call(b, 200, ret, params);
                    });
                    return params.request;
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
                    fn: function (data, method, headers) {
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
    
            
            //SetUp
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
            
            describe("test combinations of plugin processing.", function () {
                it("test factory level plugins", function () {
                    serviceTSP.readModel({modelNumber: "123"});
                    assert.isFalse(factoryGotData === null);
                    assert.isTrue(factoryCorrectScope);
                    assert.isTrue(factoryGotData.readByMock);
                    assert.isTrue(serviceTSP.factoryGotMixin);
                    assert.isTrue(factoryReadCalled);
                    assert.isTrue(factoryResponseCalled);
                    assert.isTrue(factoryRequestCalled);
                });
                
                it("test factory level plugins", function () {
                    serviceTSP.listModel({});
                    assert.isFalse(factoryGotData === null);
                    assert.isTrue(factoryGotData.length > 0);
                    assert.isTrue(serviceTSP.factoryGotMixin);
                    assert.isTrue(factoryReadCalled);
                    assert.isTrue(factoryResponseCalled);
                    assert.isTrue(factoryRequestCalled);
                });
                
                describe("test service level plugin overrides", function () {
                    it("add should work", function () {
                        serviceTSP.addPlugin(additionalPlugin);
                        serviceTSP.readModel({modelNumber: "123"});
                        assert.isTrue(factoryGotData === null);
                        assert.isTrue(serviceTSP.factoryGotMixin);
                        assert.isTrue(factoryReadCalled);
                        assert.isTrue(factoryResponseCalled);
                        assert.isTrue(factoryRequestCalled);
                        assert.isTrue(additionalPluginCalled);
                        assert.isTrue(additionalPluginCalledWithCorrectScope);
                    });
                    
                    additionalPluginCalled = false;
                    
                    it("remove should work", function () {
                        serviceTSP.removePlugin(additionalPlugin);
                        serviceTSP.readModel({modelNumber: "123"});
                        assert.isFalse(factoryGotData === null);
                        assert.isTrue(serviceTSP.factoryGotMixin);
                        assert.isTrue(factoryReadCalled);
                        assert.isTrue(factoryResponseCalled);
                        assert.isTrue(factoryRequestCalled);
                        assert.isFalse(additionalPluginCalled);
                    });
                    
                });
                
                describe("test invocation level plugin overrides", function () {
                    it("Should override", function () {
                        serviceTSP.readModel({modelNumber: "123"}, [additionalPlugin]);
                        assert.isTrue(factoryGotData === null);
                        assert.isTrue(serviceTSP.factoryGotMixin);
                        assert.isTrue(factoryReadCalled);
                        assert.isTrue(factoryResponseCalled);
                        assert.isTrue(factoryRequestCalled);
                        assert.isTrue(additionalPluginCalled);
                        assert.isTrue(additionalPluginCalledWithCorrectScope);
                    });
                    
                    additionalPluginCalled = false;
                    
                    it("should still work without override", function () {
                        serviceTSP.readModel({modelNumber: "123"});
                        assert.isFalse(factoryGotData === null);
                        assert.isTrue(serviceTSP.factoryGotMixin);
                        assert.isTrue(factoryReadCalled);
                        assert.isTrue(factoryResponseCalled);
                        assert.isTrue(factoryRequestCalled);
                        assert.isFalse(additionalPluginCalled);
                    });
                });
                
                it("test \"provider\" plugin execution.", function () {
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
        
                    assert.isTrue(model.overrideRead);
        
                    model = {modelNumber: "123"};
                    service = serviceFactoryTSP.getServiceByName("Schema/SimpleTestServiceSchema");
                    service.readModel(model);
        
                    assertUndefined(model.overrideRead);
        
                    service.readModel(model, [providerPlugin]);
                    assert.isTrue(model.overrideRead);
                });
            });
    });

