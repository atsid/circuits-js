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

    var MockProviderBinary = declare(DataProvider, {
            resp: SimpleTestModelResponse,
            create: function (params) {
                var that = this;
                this.resp.model.createdByMock = params.headers;
                params.request = new Request({}, function () {
                    params.handler.call(null, 200, that.resp, params);
                });
                return params.request;
            },
            read: function (params) {
                this.resp.model.createdByMock = params.headers;
                var that = this;
                params.request = new Request(params, function () {
                    params.handler.call(this, 200, that.resp, params);
                });
                if (!params.dontExecute) {
                    params.request.execute();
                }
                return params.request;
            }
        }),
        mockProviderBinary = new MockProviderBinary(),
        serviceFactoryBinary,
        serviceBinary;

    describe("TestBinaryService", function() {

        // Create a service in the recommended way using a factory with default resolution but
        // injecting a mock DataProvider.
        beforeEach(function() {
            // handle synchronous loading of service descriptors.
            serviceFactoryBinary = new ServiceFactory({
                provider: mockProviderBinary,
                resolver: SyncResolveServices
            });
            serviceBinary = serviceFactoryBinary.getServiceByName("Schema/BinaryObjectService");
        });

        // test that the service description is read correctly.
        it("testBinaryUpload", function () {
            var svcfactory = new ServiceFactory(),
                resp;

            serviceBinary.uploadDocument(new FormData(), {load: function (data, params) {
                resp = data;
                assert.isDefined(resp.model.createdByMock["Content-Type"]);
            }});

        });

        // test that the service description is read correctly.
        it("testBinaryDownload", function () {
            var svcfactory = new ServiceFactory(),
                resp = null,
                req;

            req = serviceBinary.downloadDocument(new FormData(), {load: function (data, params) {
                resp = data;
            }});

            assert.isTrue(resp === null);
            assert.isTrue(req.url === "binaryobjects/documents");
            assert.isTrue(req.mediaType === "application/pdf");
        });

    });
});