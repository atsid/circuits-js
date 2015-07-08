require([
    "circuits/Request"
], function (
    Request
) {
    

    /**
     * Test the primitive request methods.
     */
    describe("Test the primitive request methods.", function () {
        it("Test simple create and execute request.", function () {
            var rawData = {somedata: true},
            req = new Request({
                p1: true,
                handler: function (responseCode, data, ioArgs) {
                    assert.isTrue(req.complete);
                    assert.isFalse(req.pending);
                    assert.isTrue(data.executed);
                }
            }, function (params) {
                assert.isTrue(req.pending);
                rawData.executed = true;
                params.handler.call(req, 200, rawData, {});
            });

            assert.isFalse(req.complete);
            assert.isFalse(req.pending);
            assert.isFalse(req.canceled);
            req.execute();
            assert.isTrue(req.complete);
            assert.isTrue(rawData.executed);
            assert.isFalse(req.pending);
            assert.isFalse(req.canceled);
        });
    });
    


});