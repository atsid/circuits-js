require([
    "circuits/Request"
], function (
    Request
) {
    var b;

    /**
     * Test the primitive request methods.
     */
    b = new TestCase("TestRequest", {

        setUp: function () {
        },

        // Test simple create and execute request.
        testSimpleCreateExecute: function () {
            var rawData = {somedata: true},
                req = new Request({
                    p1: true,
                    handler: function (responseCode, data, ioArgs) {
                        assertTrue(req.complete);
                        assertFalse(req.pending);
                        assertTrue(data.executed);
                    }
                }, function (params) {
                    assertTrue(req.pending);
                    rawData.executed = true;
                    params.handler.call(req, 200, rawData, {});
                });

            assertFalse(req.complete);
            assertFalse(req.pending);
            assertFalse(req.canceled);
            req.execute();
            assertTrue(req.complete);
            assertTrue(rawData.executed);
            assertFalse(req.pending);
            assertFalse(req.canceled);
        }

    });

});