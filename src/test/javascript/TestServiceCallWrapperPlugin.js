require([
    "circuits/plugins/ServiceCallWrapperPlugin"
], function (
    ServiceCallWrapperPlugin
) {

    var b;

    /**
     * Test the ServiceCallWrapperPlugin in isolation.
     */
    b = new TestCase("TestServiceCallWrapperPlugin", {

        setUp: function () {
        },

        /**
         * Test that the wrap method is called with a fake service.
         */
        testSimpleWrap: function () {
            var testing = "",
                service = {
                    call1: function (params, callbacks) {
                        testing = testing.concat(params, callbacks);
                    }
                },
                plug = new ServiceCallWrapperPlugin({
                    wrapperMethod : function (myarg1, myarg2, myarg3, myarg4, standardCall) {
                        testing = myarg1.concat(myarg2);
                        standardCall(myarg3, myarg4);
                    }
                });
            plug.fn(service, ["call1"]);
            service.call1("one,", "two,", "three,", "four");
            assertEquals(testing, "one,two,three,four");
        }

    });
});
