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
                    params.request = new Request({}, function () {
                        if (this.offline) {
                            params.xhr.status = 0;
                            params.request.inError = true;
                            params.request.complete = true;
                            //XXX: 3/18/13 NRE - commented out callback due to recursion issue now that request is actually executing
                            //this was previously not executing properly, and hence not actually running asserts
                            //params.load.call(b, {}, params);
                            //params.error.call(b, {}, params);
                        } else {
                            params.request.complete = true;
                            //params.load.call(b, this.data, params);
                        }
                    });
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
        //setUp
        this.mockDelegate = new MockProviderDelegate();
        this.provider = new OfflineTolerantProvider(this.mockDelegate);
        
        describe("Test the primitive provider methods", function () {
            it("Test the update method on offline provider.", function () {
                this.mockDelegate.offline = true;
                var req = this.provider.update({
                    url: "update/resource/1",
                    payload: {
                        mydata: "data"
                    },
                    load: function (data, ioArgs) {
                        assert.isUndefined(data.updateCalled);
                        assert.equal("data", data.mydata);
                    },
                    error: function (data, ioArgs) {
                        assert.isFalse(true);
                    }
                });
            });
            
            it("Test the delete method on offline provider.", function () {
                this.mockDelegate.offline = true;
                var req = this.provider.del({
                    url: "delete/resource/1",
                    payload: {
                        mydata: "data"
                    },
                    load: function (data, ioArgs) {
                        assert.isUndefined(data.deleteCalled);
                        assert.equal("data", data.mydata);
                    },
                    error: function (data, ioArgs) {
                        assert.isFalse(true);
                    }
                });
            });
        });
        
    
    });
