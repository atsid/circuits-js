require([
    "circuits/plugins/RetryOnErrorPlugin"
], function (
    RetryOnErrorPlugin
) {

    var b;

    /**
     * Test the RetryOnErrorPlugin in isolation.
     */
    b = new TestCase("TestRetryOnErrorPlugin", {

        setUp: function () {
        },

        /**
         * Test that the request is re-executed the correct number of times before
         * calling the configured error function.
         */
        testSimpleRetry: function () {
            var numberOfTries = 0,
                fnCalled = false,
                mscope = {mockScope: true},
                plugin = new RetryOnErrorPlugin({
                    retry:  10,
                    scope: mscope,
                    callback: function (data, params) {
                        if (this.mockScope) {
                            fnCalled = true;
                        }
                    }
                }),
                mockRequest = {
                    execute: function () {
                        numberOfTries += 1;
                        plugin.fn.call(this, {}, {request: mockRequest});
                    }
                };
            mockRequest.execute();
            assertTrue(fnCalled);
            // the initial execute plus the ten retries.
            assertEquals(11, numberOfTries);

            // test the plugin resets properly.
            numberOfTries = 0;
            fnCalled = false;
            mockRequest.execute();
            assertTrue(fnCalled);
            // the initial execute plus the ten retries.
            assertEquals(11, numberOfTries);
        }

    });
});
