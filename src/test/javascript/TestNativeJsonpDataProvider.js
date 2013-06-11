require([
    "circuits/DataProvider",
    "circuits/NativeJsonpDataProvider",
    "circuits/Plugin",
    "circuits/Request",
    "circuits/ServiceFactory",
    "circuits/Service",
    "test/SyncResolveServices",
    "test/MockJsonpDataProvider",
    "Schema/JsonpTestServiceSchema"
], function (
    DataProvider,
    NativeJsonpDataProvider,
    Plugin,
    Request,
    ServiceFactory,
    Service,
    SyncResolveServices,
    MockJsonpDataProvider,
    JsonpTestServiceSchema
) {
    var b, dataProvider;
    b = new AsyncTestCase("TestNativeJsonpDataProvider", {

        setUp: function () {
            dataProvider = new NativeJsonpDataProvider();
        },
        
        // these tests don't need to be async
        /*
         * Helper makes the call to updateQueryString.
         */
        _testQueryString: function (url) {
            return dataProvider.updateQueryString(url, 'callback', 'test');
        },
        
        testSimpleQuery: function () {
            var url = 'http://test.me',
                expected = url + '?callback=test';
            assertEquals(expected, this._testQueryString(url));
        },
        
        testComplexQuery: function () {
            var url = 'http://test.me?one=one&two=two&three=three',
                expected = url + '&callback=test';
            assertEquals(expected, this._testQueryString(url));
        },
        
        /*
         * Unlikely case of receiving a service url appended with a hash tag is handled.
         */
        testFragmentQuery: function () {
            var url = 'http://test.me?one=one&two=two&three=three#id',
                expected = 'http://test.me?one=one&two=two&three=three&callback=test';
            assertEquals(expected, this._testQueryString(url));
        },
        
        /*
         * Case where url already has the callback appended.
         */
        testExistingQuery: function () {
            var url = 'http://test.me?one=one&two=two&callback=test';
            assertEquals(url, this._testQueryString(url));
        },
        
        /*
         * Async
         * Tests success condition.
         * Uses a mock provider to ensure the correct callback name is used 
         *  for a file system call.
         */
        testSingleReadViaServiceMachinery: function (queue) {
            var expected = '123',
                ret,
                callbackFn = function (data) {
                    ret = data;
                },
                factory = new ServiceFactory({
                    provider: new MockJsonpDataProvider(), 
                    resolver: SyncResolveServices
                }),
                svc = factory.getServiceByName("Schema/JsonpTestServiceSchema");
                
            queue.call("Execute the jsonp invoke call.", function (cbs) {
                var f1 = cbs.add(callbackFn);
                req = svc.getModel({
                    load: f1
                });
            });
            
            queue.call("Check results.", function (cbs) {
                assertEquals(expected, ret.data);
            });
        },
        
        /*
         * Async
         * Simple test of the provider read method.
         * Tests timeout failure condition.
         */
        /*testTimeoutErrorDirectly: function (queue) {
            var expected = 'timeout',
                ret,
                errorFn = function (err) {
                    ret = err.message;
                };
                
            queue.call("Execute the jsonp provider read call.", function (cbs) {
                var f1 = cbs.add(errorFn);
                dataProvider.read({
                    payload: {
                        error: f1
                    },
                    jsonpCallback: 'callback',
                    jsonpCallbackParam: 'callback',
                    url: '/test/src/test/data/nonexistentFile.json',
                    timeout: 1000
                }).execute();
            });
            
            queue.call("Check results.", function (cbs) {
                assertEquals(expected, ret);
            });
        },*/
        
        /*
         * Async
         * Simple test of the provider read method.
         * Tests script error condition.
         */
        testScriptErrorDirectly: function (queue) {
            var expected = 'error',
                ret,
                errorFn = function (err) {
                    ret = err.message;
                };
                
            queue.call("Execute the jsonp provider read call.", function (cbs) {
                var f1 = cbs.add(errorFn);
                dataProvider.read({
                    payload: {
                        error: f1
                    },
                    jsonpCallback: 'callback',
                    jsonpCallbackParam: 'callback',
                    url: '/test/src/test/data/nonexistentFile.json'
                }).execute();
            });
            
            queue.call("Check results.", function (cbs) {
                try {
                    assertEquals(expected, ret.type);
                } catch (e) {
                    jstestdriver.console.log(e);
                    throw e;
                }

            });
        }
    });
});