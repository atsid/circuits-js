require([
    "circuits/DataProvider",
    "circuits/OfflineTolerantProvider",
    "circuits/declare",
    "circuits/util",
    "circuits/Request"
], function (
    DataProvider,
    OfflineTolerantProvider,
    declare,
    Util,
    Request
) {
    
        var util = new Util(), b,
            MockProviderDelegate = declare(DataProvider, {
                offline: false,
                data: {},
                execute: function (signalName, params) {
                    this.data = {};
                    this.data[signalName] = params;
                    util.mixin(this.data, params.payload);
                    params.xhr = {};
                    params.xhr.status = 200;
                    params.request = new Request({}, function () {});
                    if (this.offline) {
                        params.xhr.status = 0;
                        params.request.inError = true;
                        params.request.complete = true;
                        params.load.call(b, {}, params);
                        params.error.call(b, {}, params);
                    } else {
                        params.request.complete = true;
                        params.load.call(b, this.data, params);
                    }
                    return params.request;
                },
                test: function (params) {
                    return !this.offline;
                },
                create: function (params) {
                    return this.execute("createCalled", params);
                },
                read: function (params) {
                    return this.execute("readCalled", params);
                },
                update: function (params) {
                    return this.execute("updateCalled", params);
                },
                del: function (params) {
                    return this.execute("deleteCalled", params);
                }
            });
        
        /**
         * Test the primitive provider methods
         */
        b = new TestCase("TestOfflineTolerantProvider", {
        
            setUp: function () {
                this.mockDelegate = new MockProviderDelegate();
                this.provider = new OfflineTolerantProvider(this.mockDelegate);
            },
        
            // Test the update method on offline provider.
            testUpdate: function () {
                this.mockDelegate.offline = true;
                var req = this.provider.update({
                    url: "update/resource/1",
                    payload: {
                        mydata: "data"
                    },
                    load: function (data, ioArgs) {
                        assertUndefined(data.updateCalled);
                        assertEquals("data", data.mydata);
                    },
                    error: function (data, ioArgs) {
                        assertFalse(true);
                    }
                });
            },
        
            // Test the delete method on offline provider.
            testDelete: function () {
                this.mockDelegate.offline = true;
                var req = this.provider.del({
                    url: "update/resource/1",
                    payload: {
                        mydata: "data"
                    },
                    load: function (data, ioArgs) {
                        assertUndefined(data.updateCalled);
                        assertEquals("data", data.mydata);
                    },
                    error: function (data, ioArgs) {
                        assertFalse(true);
                    }
                });
            }
        
        });
    
    });
