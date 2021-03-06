define([
    "circuits/ServiceFactory",
    "circuits/Service",
    "circuits/ZypSMDReader",
    "circuits/DataProvider",
    "Schema/SimpleTestModelSchema",
    "Schema/responses/SimpleTestModelResponse",
    "Schema/models/SimpleTestModel",
    "Schema/SimpleTestServiceSchema",
    "circuits/declare",
    "circuits/Request",
    "circuits/plugins/RetryOnErrorPlugin",
    "test/SyncResolveServices"
], function (
    Factory,
    Service,
    Reader,
    DataProvider,
    SimpleTestModelSchema,
    SimpleTestModelResponse,
    SimpleTestModel,
    SimpleTestServiceSchema,
    declare,
    Request,
    RetryOnErrorPlugin,
    SyncResolveServices
) {
        var b,
            MockProviderCRUD = declare(DataProvider, {
                resp: SimpleTestModelResponse,
                create: function (params) {
                    var that = this;
                    params.request = new Request({}, function () {
                        that.resp.model.createdByMock = true;
                        params.handler.call(b, 200, that.resp, params);
                    });
                    return params.request;
                },
                read: function (params) {
                    var that = this;
                    params.request = new Request({}, function () {
                        if (params.url.indexOf("array") !== -1) {
                            that.resp.model.readArrayByMock = true;
                            params.handler.call(b, 200, [that.resp, that.resp], params);
                        } else if (params.url.indexOf("error") !== -1) {
                            that.resp.model.readErrorByMock = that.resp.model.readErrorByMock ? that.resp.model.readErrorByMock + 1 : 1;
                            params.handler.call(b, 400, that.resp, params);
                        } else {
                            that.resp.model.readByMock = true;
                            params.handler.call(b, 200, that.resp, params);
                        }
                    });

                    return params.request;
                },
                update: function (params) {
                    var that = this;
                    params.request = new Request({}, function () {
                        that.resp.model.updatedByMock = true;
                        if (typeof (params.payload.length) === 'number') {
                            that.resp.model.arrayUpdate = params.payload;
                            params.handler.call(b, 200, [that.resp, that.resp], params);
                        } else {
                            params.handler.call(b, 200, that.resp, params);
                        }
                    });
                    return params.request;
                },
                del: function (params) {
                    var that = this;
                    params.request = new Request({}, function () {
                        that.resp.model.deletedByMock = true;
                    });
                    return params.request;
                }
            }),
            mockProviderCRUD = new MockProviderCRUD(),
            serviceFactoryCRUD,
            serviceCRUD,
            gotData,
            newParams,
            handlerPlugin = {
                type: 'handler',
                fn: function (data, params, total) {
                    gotData = data;
                    newParams = params;
                }
            };

        // test standard CRUD operations of a service using a factory to create, plugins to process results
        // etc...
        describe("TestServiceCRUD", function() {

            // Create a service in the recommended way using a factory with default resolution but
            // injecting a mock DataProvider.
            beforeEach(function () {
                //mock provider instance is now referenced inside requests, so the test data is effectively cached and needs to be reset
                mockProviderCRUD.resp.model.createdByMock = false;
                mockProviderCRUD.resp.model.readArrayByMock = false;
                mockProviderCRUD.resp.model.readErrorByMock = false;
                mockProviderCRUD.resp.model.readByMock = false;
                mockProviderCRUD.resp.model.updatedByMock = false;
                mockProviderCRUD.resp.model.arrayUpdate = false;
                mockProviderCRUD.resp.model.deletedByMock = false;

                serviceFactoryCRUD = new Factory({provider: mockProviderCRUD, plugins: [handlerPlugin], resolver: SyncResolveServices });
                serviceCRUD = serviceFactoryCRUD.getServiceByName("Schema/SimpleTestServiceSchema");
                gotData = null;
            });

            // test create call
            it("testCreate",  function () {
                var params = {payload: {model: SimpleTestModel}},
                    req = serviceCRUD.createModel(params);
                assert.isFalse(gotData === null);
                assert.isTrue(gotData.createdByMock);
                assert.equal(req.id, newParams.request.id);
            });

            // test update call
            it("testUpdate",  function () {
                serviceCRUD.updateModel({modelNumber: "123", payload: {model: SimpleTestModel}});
                assert.isFalse(gotData === null);
                assert.isTrue(gotData.updatedByMock);
            });

            // test read call
            it("testRead",  function () {
                serviceCRUD.readModel({modelNumber: "123"});
                assert.isFalse(gotData === null);
                assert.isTrue(gotData.readByMock);
            });

            // test read call with a load override
            it("testReadWithLoadOverride",  function () {
                serviceCRUD.readModel({modelNumber: "123"}, {
                    onLoad: function (data, params, total) {
                        params.plugin.stopProcessing = true;
                    }
                });
                // should not have called default handler.
                assert.isTrue(gotData === null);
            });

            // test read call with error and retries.
            it("testErrorRead",  function () {
                var fnCalled = false,
                    testdata = null,
                    mscope = {mockScope: true},
                    plugin = new RetryOnErrorPlugin({
                        retry: 10,
                        scope: mscope,
                        callback: function (data, params) {
                            if (this.mockScope) {
                                testdata = data;
                                fnCalled = true;
                            }
                        }
                    });
                serviceCRUD.readModel({modelNumber: "error"}, [plugin]);
                assert.isFalse(testdata === null);
                assert.isTrue(fnCalled);
                assert.equal(11, testdata.model.readErrorByMock);
            });

            // test read array call
            it("testReadArray",  function () {
                serviceCRUD.readArray({modelNumber: "123"});
                assert.isFalse(gotData === null);
                assert.isTrue(gotData[0].model.readArrayByMock);
                assert.isDefined(gotData.length);
                assert.equal(2, gotData.length);
            });

            // test update array call
            it("testUpdateArray",  function () {
                serviceCRUD.updateArray({
                    modelNumber: "123",
                    payload: [
                        {modelNumber: "123"},
                        {modelNumber: "456"}
                    ]
                });
                assert.isFalse(gotData === null);
                assert.isTrue(gotData[0].model.updatedByMock);
                assert.equal(2, gotData[0].model.arrayUpdate.length);
            });

            // test delete call
            it("testDelete",  function () {
                serviceCRUD.deleteModel({modelNumber: "123"});
                assert.isTrue(gotData === null);
                assert.isTrue(mockProviderCRUD.resp.model.deletedByMock);
            });

        });

    });