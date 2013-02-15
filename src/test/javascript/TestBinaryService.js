require([
    "circuits/ServiceFactory",
    "circuits/Service",
    "circuits/DataProvider",
    "circuits/Request",
    "circuits/declare",
    "test/SyncResolveServices",
    "Schema/responses/SimpleTestModelResponse"
], function (
    ServiceFactory,
    Service,
    DataProvider,
    Request,
    declare,
    SyncResolveServices,
    SimpleTestModelResponse
) {

    var b,
        MockProviderBinary = declare(DataProvider, {
            resp: SimpleTestModelResponse,
            create: function (params) {
                this.resp.model.createdByMock = params.headers;
                params.handler.call(b, 200, this.resp, params);
                return new Request({}, function () {
                });
            },
            read: function (params) {
                this.resp.model.createdByMock = params.headers;
                var that = this, req = new Request(params, function () {
                    params.handler.call(dojo.global, 200, that.resp, params);
                });
                if (!params.dontExecute) {
                    req.execute();
                }
                return req;
            }
        }),
        mockProviderBinary = new MockProviderBinary(),
        serviceFactoryBinary,
        serviceBinary;

    b = new TestCase("TestBinaryService", {

        // Create a service in the recommended way using a factory with default resolution but
        // injecting a mock DataProvider.
        setUp: function () {
            // handle synchronous loading of service descriptors.
            serviceFactoryBinary = new ServiceFactory({
                provider: mockProviderBinary,
                resolver: SyncResolveServices
            });
            serviceBinary = serviceFactoryBinary.getServiceByName("Schema/BinaryObjectService");
        },

        // test that the service description is read correctly.
        testBinaryUpload: function () {
            var svcfactory = new ServiceFactory(),
                resp;

            serviceBinary.uploadDocument(new FormData(), {load: function (data, params, count) {
                resp = data;
            }});
            assertNotUndefined(resp.model.createdByMock["Content-Type"]);
        },

        // test that the service description is read correctly.
        testBinaryDownload: function () {
            var svcfactory = new ServiceFactory(),
                resp = null,
                req;

            req = serviceBinary.downloadDocument(new FormData(), {load: function (data, params, count) {
                resp = data;
            }});

            assertTrue(resp === null);
            assertTrue(req.url === "binaryobjects/documents");
            assertTrue(req.mediaType === "application/pdf");
        }

    });
});
