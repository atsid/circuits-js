define([
    "circuits/ServiceFactory",
    "circuits/Service",
    "circuits/DataProvider",
    "circuits/Request",
    "circuits/declare",
    "Schema/SimpleTestServiceSchema",
    "Schema/models/SimpleTestModel",
    "test/SyncResolveServices"
], function (
    ServiceFactory,
    Service,
    DataProvider,
    Request,
    declare,
    SimpleTestServiceSchema,
    SimpleTestModel,
    SyncResolveServices
) {

    // test the creation and execution of a service queue.

    describe("Test ServiceQueue", function () {
        it("Test basic queue execution", function (done) {
            var MockProviderClass = declare(null, {
                read: function (params) {
                    params.payload.readByMock = true;
                    setTimeout(function () {
                        params.handler.call(null, 200, params.payload, params);
                    }, 500);
                    return new Request({}, function () {
                    });
                },
                httpMethodMap: {
                    'GET': {method: 'read', hasPayload: false}
                }
            }),
            mockProvider = new MockProviderClass(),
            serviceFactory = new ServiceFactory({provider: mockProvider, resolver: SyncResolveServices}),
            params = {modelNumber: "1", payload: {model: SimpleTestModel}},
            loadCalled = 0,
            loadQueueCalled = 0,
            svcQueue,
            svc = serviceFactory.getServiceByName("Schema/SimpleTestServiceSchema"),
            svc1 = serviceFactory.getServiceByName("Schema/SimpleTestServiceSchema"),
            loadFn = function (data, params, count) {
                loadCalled += 1;
            },
            loadQueue = function (requests) {
                loadQueueCalled += 1;
                assert.equal(2, loadCalled);
                assert.equal(1, loadQueueCalled);
                assert.isFalse(svcQueue.hasErrors());
                assert.equal(2, svcQueue.getCompletedRequests().length);
                done();
            };

            svcQueue = serviceFactory.getServiceQueue();
            svcQueue.add(svc.readModel, params, {scope: this, load: loadFn});
            svcQueue.add(svc1.readModel, params, {scope: this, load: loadFn});

            // Execute the service calls.
            svcQueue.execute(loadQueue);
        });

        it("Test refresh queue execution", function (done) {
            var MockProviderClass = declare(null, {
                read: function (params) {
                    params.payload.readByMock = true;
                    setTimeout(function () {
                        params.handler.call(this, 200, params.payload, params);
                    }, 50);
                    return new Request({}, function () {
                    });
                },
                httpMethodMap: {
                    'GET': {method: 'read', hasPayload: false}
                }
            }),
            mockProvider = new MockProviderClass(),
            serviceFactory = new ServiceFactory({provider: mockProvider, resolver: SyncResolveServices}),
            params = {modelNumber: "1", payload: {model: SimpleTestModel}},
            loadCalled = 0,
            loadQueueCalled = 0,
            svcQueue,
            svc = serviceFactory.getServiceByName("Schema/SimpleTestServiceSchema"),
            svc1 = serviceFactory.getServiceByName("Schema/SimpleTestServiceSchema"),
            loadFn = function (data, params, count) {
                loadCalled += 1;
            },
            loadQueueCalledTwice = function () {
            },
            loadQueue = function (requests) {
                loadQueueCalled += 1;
                if (loadQueueCalled === 2) {
                    assert.equal(4, loadCalled);
                    assert.equal(2, loadQueueCalled);
                    assert.isFalse(svcQueue.hasErrors());
                    assert.equal(2, svcQueue.getCompletedRequests().length);

                    // setTimeout to get it out of this callback
                    setTimeout(function() {
                        // clear queue and check that it doesn't get executed again.
                        svcQueue.clear();
                    }, 0);
                    setTimeout(function() {
                        done();
                    }, 200);
                } else if (loadQueueCalled > 2) {
                    // check results again after clear and timeout to make sure
                    // the queue hasn't been executed again.
                    // assert.equal(4, loadCalled);
                    // assert.equal(2, loadQueueCalled);
                    assert.fail(false, true, "Load queue called WAAAAY too many times");
                }
            };

            svcQueue = serviceFactory.getServiceQueue({autoRefreshInterval: 100});
            svcQueue.add(svc.readModel, params, {scope: this, load: loadFn});
            svcQueue.add(svc1.readModel, params, {scope: this, load: loadFn});

            svcQueue.execute(loadQueue);
        });
    });

});
