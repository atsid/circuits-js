define([
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
    describe("TestNativeJsonpDataProvider", function() {

        beforeEach(function () {
            dataProvider = new NativeJsonpDataProvider();
        });

        function testQueryString(url) {
            return dataProvider.updateQueryString(url, 'callback', 'test');
        }

        it("testSimpleQuery",  function () {
            var url = 'http://test.me',
                expected = url + '?callback=test';
            assert.equal(expected, testQueryString(url));
        });

        it("testComplexQuery",  function () {
            var url = 'http://test.me?one=one&two=two&three=three',
                expected = url + '&callback=test';
            assert.equal(expected, testQueryString(url));
        });

        /*
         * Unlikely case of receiving a service url appended with a hash tag is handled.
         */
        it("testFragmentQuery",  function () {
            var url = 'http://test.me?one=one&two=two&three=three#id',
                expected = 'http://test.me?one=one&two=two&three=three&callback=test';
            assert.equal(expected, testQueryString(url));
        });

        /*
         * Case where url already has the callback appended.
         */
        it("testExistingQuery",  function () {
            var url = 'http://test.me?one=one&two=two&callback=test';
            assert.equal(url, testQueryString(url));
        });

        /*
         * Async
         * Tests success condition.
         * Uses a mock provider to ensure the correct callback name is used
         *  for a file system call.
         */
        it("testSingleReadViaServiceMachinery",  function (done) {
            var expected = '123',
                ret,
                factory = new ServiceFactory({
                    provider: new MockJsonpDataProvider(),
                    resolver: SyncResolveServices
                }),
                svc = factory.getServiceByName("Schema/JsonpTestServiceSchema");

            svc.getModel({}, {
                load: function (data) {
                   assert.equal(expected, data.data);
                   done();
                }
            });
        });

        /*
         * Async
         * Simple test of the provider read method.
         * Tests timeout failure condition.
         */
        /*it("testTimeoutErrorDirectly",  function (queue) {
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
                    url: '/base/test/data/nonexistentFile.json',
                    timeout: 1000
                }).execute();
            });

            queue.call("Check results.", function (cbs) {
                assert.equal(expected, ret);
            });
        },*/

        /*
         * Async
         * Simple test of the provider read method.
         * Tests script error condition.
         */
        it("Test script error directly", function (done) {
            var expected = 'error',
            errorFn = function (status, err) {
                assert.equal(expected,  err.message.type);
                done();
            };

            // Execute the jsonp provider read call.
            dataProvider.read({
                payload: {
                },
                handler: errorFn,
                jsonpCallback: 'callback',
                jsonpCallbackParam: 'callback',
                url: '/base/test/data/nonexistentFile.json'
            }).execute();
        });
    });
});