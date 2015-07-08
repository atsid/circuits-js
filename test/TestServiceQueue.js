require([
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

    var b;

    // test the creation and execution of a service queue.
    
    describe("Test ServiceQueue", function () {
        it("Test basic queue execution", function (queue) {
            var MockProviderClass = declare(null, {
                read: function (params) {
                    params.payload.readByMock = true;
                    setTimeout(function () {
                        params.handler.call(b, 200, params.payload, params);
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
            };

            svcQueue = serviceFactory.getServiceQueue();
            svcQueue.add(svc.readModel, params, {scope: this, load: loadFn});
            svcQueue.add(svc1.readModel, params, {scope: this, load: loadFn});
            queue.call("Execute the service calls.", function (cbs) {
                var f = cbs.add(loadQueue);
                svcQueue.execute(f);
            });
            queue.call("check results", function () {
                assert.equal(2, loadCalled);
                assert.equal(1, loadQueueCalled);
                assert.isFalse(svcQueue.hasErrors());
                assert.equal(2, svcQueue.getCompletedRequests().length);
            });
        });
        
        it("Test refresh queue execution", function (queue) {
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
            };

            svcQueue = serviceFactory.getServiceQueue({autoRefreshInterval: 100});
            svcQueue.add(svc.readModel, params, {scope: this, load: loadFn});
            svcQueue.add(svc1.readModel, params, {scope: this, load: loadFn});
    
            queue.call("Execute the auto-refresh queue.", function (cbs) {
                var f = cbs.add(loadQueue, 2);
                svcQueue.execute(f);
            });
            queue.call("check results for queue executing twice", function (cbs) {
                var nullfunc = cbs.add(function () {
                });
                assert.equal(4, loadCalled);
                assert.equal(2, loadQueueCalled);
                assert.isFalse(svcQueue.hasErrors());
                assert.equal(2, svcQueue.getCompletedRequests().length);
    
                // clear queue and check that it doesn't get executed again.
                svcQueue.clear();
                setTimeout(nullfunc, 200);
            });
    
            // check results again after clear and timeout to make sure
            // the queue hasn't been executed again.
            queue.call("check results again", function (cbs) {
                assert.equal(4, loadCalled);
                assert.equal(2, loadQueueCalled);
            });
        });
    });
    
});
