require([
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
    this.dataProvider = new NativeXhrDataProvider();
    
    describe("Test NativeXhrDataProvider", function () {
        it("testReadDirectly", function (queue) {
            var req,
            res,
            loadfn = function (data, ioArgs) {
                res = "done";
            },
            errorfn = function (data, ioArgs) {
                res = "error";
            };

            queue.call("Execute the service call.", function (cbs) {
                var f1 = cbs.add(loadfn);
                req = this.dataProvider.read({
                    url: location.protocol + "//" + location.host + "/test/target/test-source/test/javascript/TestNativeXhrDataProvider.js",
                    handler: f1,
                    responseType: "text",
                    error: errorfn
                });
            });
    
            queue.call("Check results.", function (cbs) {
                assertNotUndefined(res);
                assertEquals("done", res);
    
            });
        });
        
        it("Test readViaServiceMachinery", function (queue) {
            var urlPlug = new UrlPrefixPlugin({
                pointcut: "*.*",
                name: "addServiceRoot",
                prefix: location.protocol + "//" + location.host + "/"
            }),
            factory = new ServiceFactory({
                plugins: [urlPlug],
                provider: new NativeXhrDataProvider(),
                resolver: SyncResolveServices
            }),
            ret,
            req,
            loadfn = function (data, params, count) {
                ret = data;
            },
            errorfn = function (data, params) {
                ret = "error";
            },
            svc = factory.getServiceByName("Schema/JsTestDriverServiceSchema");

            queue.call("Execute the valid service call.", function (cbs) {
                var f1 = cbs.add(loadfn);
                req = svc.readModel({modelname: "SimpleTestModelJson.js"}, {
                    load: f1,
                    error: errorfn
                });
            });
    
            queue.call("Check results.", function (cbs) {
                assertEquals("123", ret);
                assertEquals(200, req.statusCode);
            });
    
            queue.call("Execute an invalid service call.", function (cbs) {
                var f2 = cbs.add(errorfn);
                req = svc.readModel({modelname: "doesntexist.js"}, {
                    load: loadfn,
                    error: f2
                });
            });
    
            queue.call("Check results.", function (cbs) {
                assertEquals("ret not equal to error", "error", ret);
                assertEquals("status code not 404", 404, req.statusCode);
            });
        });
    });
    

    


    
});
