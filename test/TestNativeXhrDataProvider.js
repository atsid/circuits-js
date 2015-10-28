define([
    "circuits/DataProvider",
    "circuits/NativeXhrDataProvider",
    "circuits/plugins/UrlPrefixPlugin",
    "circuits/Request",
    "circuits/ServiceFactory",
    "Schema/JsTestDriverServiceSchema",
    "circuits/Service",
    "test/SyncResolveServices"
], function (
    DataProvider,
    NativeXhrDataProvider,
    UrlPrefixPlugin,
    Request,
    ServiceFactory,
    JsTestDriverServiceSchema,
    Service,
    SyncResolveServices
) {

    //test the creation and execution of a service queue.


    //setUp
    var dataProvider;
    beforeEach(function() {
        dataProvider = new NativeXhrDataProvider();
    });

    describe("Test NativeXhrDataProvider", function () {
        it("testReadDirectly", function (done) {
            var req,
            loadfn = function (data, ioArgs) {
                done();
            };

            dataProvider.read({
                url: location.protocol + "//" + location.host + "/test/target/test-source/test/javascript/TestNativeXhrDataProvider.js",
                handler: loadfn,
                responseType: "text"
            });
        });

        it("Test readViaServiceMachinery successful", function (done) {
            var urlPlug = new UrlPrefixPlugin({
                pointcut: "*.*",
                name: "addServiceRoot",
                prefix: ""
            }),
            factory = new ServiceFactory({
                plugins: [urlPlug],
                provider: new NativeXhrDataProvider(),
                resolver: SyncResolveServices
            }),
            req,
            svc = factory.getServiceByName("Schema/JsTestDriverServiceSchema");

            req = svc.readModel({modelname: "SimpleTestModelJson.js"}, {
                load: function (data) {
                    assert.equal("123", data);
                    assert.equal(200, req.statusCode);
                    done();
                },
                error: function() {
                    assert.fail("Should find file");
                }
            });
        });

        it("Test readViaServiceMachinery missing file", function (done) {
            var urlPlug = new UrlPrefixPlugin({
                pointcut: "*.*",
                name: "addServiceRoot",
                prefix: ""
            }),
            factory = new ServiceFactory({
                plugins: [urlPlug],
                provider: new NativeXhrDataProvider(),
                resolver: SyncResolveServices
            }),
            req,
            svc = factory.getServiceByName("Schema/JsTestDriverServiceSchema");

            req = svc.readModel({modelname: "doesntexist.js"}, {
                load: function() { assert.fail(false, true, "Should not be successful"); },
                error: function (data) {
                    assert.equal(404, req.statusCode, "status code not 404");
                    done();
                }
            });
        });
    });
});
