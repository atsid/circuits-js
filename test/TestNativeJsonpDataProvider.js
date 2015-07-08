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
    
    //setUp
    dataProvider = new NativeJsonpDataProvider();
    
    
    function _testQueryString (url) {
        return dataProvider.updateQueryString(url, 'callback', 'test');
    }
    
    describe("TestNativeJsonpDataProvider", function () {
        it("test simple query", function () {
            var url = 'http://test.me',
            expected = url + '?callback=test';
            assert.equal(expected, _testQueryString(url));
        });
        
        it("test complex query", function () {
            var url = 'http://test.me?one=one&two=two&three=three',
            expected = url + '&callback=test';
            assert.equal(expected, _testQueryString(url));
        });
        
        it("test fragment query", function () {
            var url = 'http://test.me?one=one&two=two&three=three#id',
            expected = 'http://test.me?one=one&two=two&three=three&callback=test';
            assert.equal(expected, _testQueryString(url));
        })
        
        it("test existing query", function () {
            var url = 'http://test.me?one=one&two=two&callback=test';
            assert.equal(url, _testQueryString(url));
       
        });
        
        /*
         * Async
         * Tests success condition.
         * Uses a mock provider to ensure the correct callback name is used 
         *  for a file system call.
         */
        it("Test Single read via service machinery", function (queue) {
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
                req = svc.getModel({}, {
                    load: f1
                });
            });
            
            queue.call("Check results.", function (cbs) {
                assert.equal(expected, ret.data);
            });
        });
        
        /*
         * Async
         * Simple test of the provider read method.
         * Tests script error condition.
         */
        it("Test script error directly", function (queue) {
            var expected = 'error',
            ret,
            errorFn = function (status, err) {
                ret = err.message;
            };
            
            queue.call("Execute the jsonp provider read call.", function (cbs) {
                var f1 = cbs.add(errorFn);
                dataProvider.read({
                    payload: {
                    },
                    handler: f1,
                    jsonpCallback: 'callback',
                    jsonpCallbackParam: 'callback',
                    url: '/test/src/test/data/nonexistentFile.json'
                }).execute();
            });
            
            queue.call("Check results.", function (cbs) {
                try {
                    assert.equal(expected, ret.type);
                } catch (e) {
                    jstestdriver.console.log(e);
                    throw e;
                }
    
            });
        });
        
    });
    
    
   

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
                assert.equal(expected, ret);
            });
        },*/
      
   
    
});